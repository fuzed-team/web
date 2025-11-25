# Rate-Limited Face Matching System

## Overview
Modify the current automatic face matching system to limit matches to **2 faces per user per hour** (configurable via `system_settings`). The system should only match with faces that are currently set as the user's default face (`default_face_id` in profiles table), and ensure no duplicate matches occur.

## Current Implementation Summary

### How It Works Now
1. **Upload Flow**: When a user uploads a face via `POST /api/faces`:
   - Face is saved to database with embedding and attributes
   - Profile's `default_face_id` is updated to the new face
   - A `match_jobs` record is created with `status='pending'`

2. **Processing Flow**: 
   - A pg_cron job runs **every minute**
   - Triggers Edge Function `match-generator`
   - Edge Function fetches **one** pending job (FIFO - oldest first)
   - Finds similar faces using `find_similar_faces_advanced()` function
   - Matches with: same school + opposite gender + 50%+ similarity
   - Creates up to 20 matches per job
   - Marks job as `completed`

### Current Issues to Address
- ❌ No rate limiting per user - can match unlimited faces per hour
- ❌ Matches ALL faces in database, not just `default_face_id`
- ❌ No tracking of which users have been matched together (potential duplicates)
- ❌ No configurable settings for match rate and time window

## Required Changes

### 1. Database Schema Changes

#### 1.1 Update `match_jobs` Table
Add columns to track rate limiting:
```sql
ALTER TABLE match_jobs
ADD COLUMN IF NOT EXISTS last_match_window TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS matches_in_window INT DEFAULT 0;
```

**Purpose:**
- `last_match_window`: Tracks the start of the current 1-hour window
- `matches_in_window`: Counts how many matches processed in current window

#### 1.3 Add System Settings
Add configurable settings to `system_settings` table:
```sql
INSERT INTO public.system_settings (key, value, description)
VALUES 
  (
    'match_rate_limit',
    '2'::jsonb,
    'Number of faces to match per user per time window'
  ),
  (
    'match_time_window_minutes',
    '60'::jsonb,
    'Time window in minutes for rate limiting (default: 60 = 1 hour)'
  )
ON CONFLICT (key) DO NOTHING;
```

### 2. Database Function Updates

#### 2.1 Update `find_similar_faces_advanced()` Function
Modify the function to:
- Only match with faces where `profile.default_face_id = face.id`
- Exclude faces that have already been matched with the query face using LEFT JOIN on existing `matches` table (no need for separate table or helper function)

**Current Signature (from migration 026):**
```sql
CREATE OR REPLACE FUNCTION find_similar_faces_advanced(
    query_face_id uuid,
    user_school text,
    user_gender text,
    match_threshold float DEFAULT 0.7,
    match_count integer DEFAULT 20
)
RETURNS TABLE (
    face_id uuid,
    profile_id uuid,
    similarity float,
    image_path text,
    name text,
    age integer,
    expression text
)
```

**Updated Version with Optimized Duplicate Prevention:**
```sql
CREATE OR REPLACE FUNCTION find_similar_faces_advanced(
    query_face_id uuid,
    user_school text,
    user_gender text,
    match_threshold float DEFAULT 0.7,
    match_count integer DEFAULT 20
    -- No exclude parameter needed - handled internally!
)
RETURNS TABLE (
    face_id uuid,
    profile_id uuid,
    similarity float,
    image_path text,
    name text,
    age integer,
    expression text
)
AS $$
BEGIN
    RETURN QUERY
    WITH query_face AS (
        SELECT f.embedding, f.age, f.symmetry_score, f.skin_tone_lab, f.expression, f.geometry_ratios
        FROM faces f WHERE f.id = query_face_id
    ),
    -- NEW: Get already matched faces directly from matches table
    already_matched AS (
        SELECT DISTINCT 
            CASE 
                WHEN face_a_id = query_face_id THEN face_b_id
                WHEN face_b_id = query_face_id THEN face_a_id
            END as matched_face_id
        FROM matches
        WHERE face_a_id = query_face_id OR face_b_id = query_face_id
    ),
    candidate_matches AS (
        SELECT f.id as face_id, p.id as profile_id,
            calculate_advanced_similarity(
                qf.embedding, qf.age, qf.symmetry_score, qf.skin_tone_lab, qf.expression, qf.geometry_ratios,
                f.embedding, f.age, f.symmetry_score, f.skin_tone_lab, f.expression, f.geometry_ratios
            ) as similarity,
            f.image_path, p.name, f.age, f.expression
        FROM faces f 
        CROSS JOIN query_face qf 
        JOIN profiles p ON f.profile_id = p.id
        LEFT JOIN already_matched am ON f.id = am.matched_face_id  -- NEW: LEFT JOIN instead of array filter
        WHERE f.id != query_face_id 
            AND f.embedding IS NOT NULL 
            AND COALESCE(f.quality_score, 0.6) >= 0.6
            AND p.school = user_school 
            AND p.gender != user_gender
            AND p.default_face_id = f.id  -- NEW: Only match faces set as default
            AND am.matched_face_id IS NULL  -- NEW: Exclude already matched (much faster than array!)
    )
    SELECT cm.face_id, cm.profile_id, cm.similarity, cm.image_path, cm.name, cm.age, cm.expression
    FROM candidate_matches cm 
    WHERE cm.similarity >= match_threshold
    ORDER BY cm.similarity DESC 
    LIMIT match_count;
END;
$$;
```

**Key Changes:**
1. Added `already_matched` CTE to fetch previously matched faces from existing `matches` table
2. Uses efficient LEFT JOIN with `IS NULL` check instead of array filtering
3. Added filter `AND p.default_face_id = f.id` to only match default faces
4. No need for extra parameters or helper functions - all handled internally
5. Reuses existing `matches` table - no duplicate data storage

**Performance Benefits:**
- ✅ No array operations (faster)
- ✅ PostgreSQL optimizes LEFT JOIN + IS NULL very well
- ✅ Can use existing indexes on `matches(face_a_id)` and `matches(face_b_id)`
- ✅ No data duplication
- ✅ Simpler code

### 3. Edge Function Updates (`match-generator/index.ts`)

#### 3.1 Fetch System Settings
At the start of job processing:
```typescript
// Fetch rate limit settings
const { data: rateLimitSetting } = await supabase
  .from("system_settings")
  .select("value")
  .eq("key", "match_rate_limit")
  .single();

const { data: timeWindowSetting } = await supabase
  .from("system_settings")
  .eq("key", "match_time_window_minutes")
  .single();

const matchRateLimit = (rateLimitSetting?.value as number) ?? 2;
const timeWindowMinutes = (timeWindowSetting?.value as number) ?? 60;
```

#### 3.2 Check Rate Limit Before Processing
Before processing a job:
```typescript
// Check if user has exceeded rate limit for current time window
const currentTime = new Date();
const windowStartTime = new Date(currentTime.getTime() - (timeWindowMinutes * 60 * 1000));

// Check current job's rate limit status
if (typedJob.last_match_window) {
  const lastWindowStart = new Date(typedJob.last_match_window);
  
  // If we're still in the same window
  if (lastWindowStart > windowStartTime) {
    if (typedJob.matches_in_window >= matchRateLimit) {
      // Rate limit exceeded, skip this job and mark it for later
      console.log(`Rate limit reached for user ${typedJob.user_id}: ${typedJob.matches_in_window}/${matchRateLimit} in window`);
      
      // Leave as pending, will be processed after window expires
      return NextResponse.json({
        success: true,
        message: "Rate limit reached, job will retry later",
        processed: false
      });
    }
  }
}
```

#### 3.3 Update Matching Function Call
```typescript
const { data: matches, error: searchError } = await supabase.rpc(
  "find_similar_faces_advanced",
  {
    query_face_id: typedJob.face_id,
    user_school: typedProfile.school,
    user_gender: typedProfile.gender,
    match_threshold: matchThreshold,
    match_count: matchRateLimit  // Only fetch the number we can match
    // No need for exclude_matched_faces - handled internally by the function!
  }
);
```

**Note:** The function now handles duplicate detection internally using LEFT JOIN on the `matches` table. No need to fetch or pass excluded faces!

#### 3.4 Update Rate Limit Counter
```typescript
// Determine if we need to reset the window
const shouldResetWindow = !typedJob.last_match_window || 
  new Date(typedJob.last_match_window) <= windowStartTime;

// Update rate limit tracking
await supabase
  .from("match_jobs")
  .update({
    last_match_window: shouldResetWindow ? currentTime.toISOString() : typedJob.last_match_window,
    matches_in_window: shouldResetWindow ? typedMatches.length : (typedJob.matches_in_window + typedMatches.length),
    status: "completed",
    completed_at: currentTime.toISOString()
  })
  .eq("id", typedJob.id);
```

### 4. API Updates (Optional)

#### 4.1 Admin API to Configure Settings
Ensure `/api/admin/settings` supports updating the new settings:
- `match_rate_limit`
- `match_time_window_minutes`

This should already work if the admin settings API is generic.

### 5. Cronjob Behavior

**No changes needed** - the cronjob will continue to run every minute, but the Edge Function will:
- Skip jobs that have hit rate limit (leave as `pending`)
- Process jobs that are within rate limit
- Jobs that hit the rate limit will automatically be picked up after the time window expires

### 6. Migration File Structure

Create a new migration file: `XXX_rate_limited_matching.sql`

Structure:
1. Add columns to `match_jobs` table
2. Create `matched_pairs` table with indexes
3. Add settings to `system_settings`
4. Update `find_similar_faces_advanced()` function
5. Create `get_matched_users()` helper function
6. Add comments and verification queries

### 7. Testing Strategy

#### 7.1 Database Testing
- Verify `matches` table already prevents duplicate face pairs (existing constraint)
- Test `find_similar_faces_advanced()` excludes already matched faces using LEFT JOIN
- Test `find_similar_faces_advanced()` only returns default faces
- Run EXPLAIN ANALYZE to verify query performance

#### 7.2 Integration Testing
- Upload 2 faces for User A → should process both (each face matched separately)
- Upload 3rd face within same hour → should be skipped (rate limit)
- Wait 1 hour → 3rd face should be processed
- Verify the same face pair (faceA-faceB) is never matched twice
- Verify User A's different faces can each match with User B's different faces
- Change `match_rate_limit` to 1 → verify it works
- Change `match_time_window_minutes` to 30 → verify it works

#### 7.3 Edge Cases
- Multiple users uploading at same time
- User uploads multiple faces quickly
- User changes `default_face_id` while jobs pending
- Rate limit = 0 (should disable matching)
- Time window crosses midnight (should work seamlessly)

## Implementation Checklist

### Phase 1: Database Schema
- [ ] Create migration file `XXX_rate_limited_matching.sql`
- [ ] Add `last_match_window` and `matches_in_window` to `match_jobs`
- [ ] Add `match_rate_limit` setting to `system_settings`
- [ ] Add `match_time_window_minutes` setting to `system_settings`
- [ ] Run migration on development database
- [ ] Verify schema changes with SQL queries

### Phase 2: Database Functions
- [ ] Update `find_similar_faces_advanced()` to:
  - [ ] Add `already_matched` CTE to query existing `matches` table
  - [ ] Add LEFT JOIN with `already_matched` CTE
  - [ ] Filter by `default_face_id`
  - [ ] Exclude already matched faces with `IS NULL` check
- [ ] Test function with sample data
- [ ] Verify performance with EXPLAIN ANALYZE

### Phase 3: Edge Function Updates
- [ ] Update `match-generator/index.ts`:
  - [ ] Fetch rate limit settings from `system_settings`
  - [ ] Check rate limit before processing job
  - [ ] Skip jobs that exceeded rate limit
  - [ ] Call `find_similar_faces_advanced()` (no extra parameters needed)
  - [ ] Update rate limit counters
  - [ ] Handle window reset logic
- [ ] Test edge function locally with sample jobs
- [ ] Deploy updated edge function

### Phase 4: Testing
- [ ] Test rate limiting works (2 matches per hour)
- [ ] Test duplicate prevention (same users not matched twice)
- [ ] Test default face filtering (only matches active faces)
- [ ] Test across time window boundaries
- [ ] Test with different settings values
- [ ] Test with multiple concurrent users
- [ ] Verify existing matches still work

### Phase 5: Monitoring & Documentation
- [ ] Add logging for rate limit hits
- [ ] Add logging for duplicate match attempts
- [ ] Create admin dashboard query to monitor:
  - [ ] Matches per user per hour
  - [ ] Rate limit compliance
  - [ ] Duplicate prevention effectiveness
- [ ] Update API documentation
- [ ] Add comments to code
- [ ] Update system architecture docs

## Key Design Decisions

### 1. Why Track in `match_jobs` Instead of Separate Table?
- **Pro**: Keeps rate limit state with the job itself
- **Pro**: Easier cleanup (when job is deleted, counters go too)
- **Con**: Need to handle multiple pending jobs per user carefully

### 2. Why Use LEFT JOIN on Existing `matches` Table Instead of Separate Table?
- **Pro**: No data duplication - reuses existing `matches` table
- **Pro**: Much better performance - LEFT JOIN + IS NULL is very fast in PostgreSQL
- **Pro**: Can leverage existing indexes on `matches(face_a_id)` and `matches(face_b_id)`
- **Pro**: Simpler code - no helper functions or extra parameters needed
- **Pro**: Less storage - no additional table
- **Pro**: Consistent source of truth - `matches` table is the single source
- **Con**: None really - this is clearly the better approach!

**Performance Comparison:**
```
❌ Array Approach: 
   - Fetch array with UNION + ARRAY_AGG
   - Pass array as parameter
   - Filter with ANY(array) - slow for large arrays

✅ LEFT JOIN Approach:
   - Simple CTE with indexed lookup
   - JOIN with IS NULL check - PostgreSQL optimizes this extremely well
   - No array operations - much faster
```

### 3. Why Keep Cronjob at 1 Minute?
- **Pro**: Users get matches quickly when rate limit allows
- **Pro**: No changes to existing infrastructure
- **Pro**: Simple to understand and maintain
- **Con**: More frequent checks (but cheap when no jobs)

### 4. Why Make Settings Configurable?
- **Pro**: Can adjust based on user growth without code changes
- **Pro**: Can A/B test different rates
- **Pro**: Can temporarily increase limits during promotions
- **Con**: More complex logic in Edge Function

## Questions & Considerations

### Will This Scale?
- **100 users**: ✅ No issues
- **1,000 users**: ✅ Should be fine
- **10,000+ users**: ⚠️ May need to:
  - Batch process multiple jobs per cronjob run
  - Add pagination to `matched_pairs` queries
  - Consider archiving old `matched_pairs` (e.g., after 30 days)

### What Happens to Old Match Jobs?
- Existing cleanup function deletes completed/failed jobs after 7 days
- This will also clean up rate limit counters automatically
- Consider adding cleanup for old `matched_pairs` records

### How to Handle Settings Changes?
- If admin increases `match_rate_limit` mid-window:
  - Jobs with old limit will continue with old limit
  - New jobs will use new limit
  - After window resets, all jobs use new limit
- If admin changes `match_time_window_minutes`:
  - Existing windows complete with old duration
  - New windows use new duration

### Edge Cases to Consider
1. **User deletes their default face**: 
   - Other users won't match with them (they have no default)
   - Their pending jobs should still process (they might set new default)

2. **User changes default face frequently**:
   - Only current default is matched
   - Previous matches remain in database
   - Good UX: users see different matches with different faces

3. **Two users upload at exact same time**:
   - Both might match with each other
   - `matched_pairs` constraint prevents duplicate entries
   - Both see each other as a match (expected behavior)

## Migration Rollback Plan

If issues arise:
```sql
-- Rollback steps
-- No tables to drop - we're using existing matches table!
ALTER TABLE match_jobs 
  DROP COLUMN IF EXISTS last_match_window,
  DROP COLUMN IF EXISTS matches_in_window;
DELETE FROM system_settings WHERE key IN ('match_rate_limit', 'match_time_window_minutes');
-- Restore old find_similar_faces_advanced function (from backup)
```

## Success Metrics

After implementation, verify:
- ✅ No user exceeds 2 matches per hour (configurable)
- ✅ No duplicate face pairs in `matches` table (existing constraint works)
- ✅ All matches use current `default_face_id` only
- ✅ System settings can be changed without redeployment
- ✅ Match rate is consistent across time windows
- ✅ Existing functionality remains intact
- ✅ Query performance is optimal (verify with EXPLAIN ANALYZE)
