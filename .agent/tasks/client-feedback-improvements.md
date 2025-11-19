# Client Feedback Improvements - Updated Requirements

**Status:** 🚧 In Progress
**Created:** 2025-11-16
**Updated:** 2025-11-18
**Priority:** High (Pre-launch requirement)

---

## Overview

**UPDATED 2025-11-18:** Client has provided new requirements that simplify and modify the original plan:
1. **Remove Live Matches entirely** - Users can ONLY see their own matches
2. **Single Celebrity of the Day** - One celebrity for all users (not gender-based)
3. **Display changes** - Show "You matched with John" instead of "Sarah matched with John"
4. **Celebrity location** - Display at top of Your Matches feed (not Live Matches)

This document has been updated to reflect the simplified requirements.

---

## Client Requirements (Updated 2025-11-18)

### 1. Remove Live Matches Feed 🚫
**Requirement:** Hide the public Live Matches page - users should ONLY see their own matches

**Current State:**
- "Live Matches" page shows ALL user-to-user matches across the platform
- Users can see other people's couples (e.g., "Sarah matched with John (85%)")
- Navigation includes link to both Live Matches and Your Matches

**Target State:**
- Remove Live Matches page from navigation completely
- Comment out live-matches route (keep code for potential future use)
- Users can ONLY access "Your Matches" page showing their own matches
- Backend API endpoint stays functional but unused

---

### 2. Celebrity of the Day Feature 🌟
**Requirement:** Display ONE celebrity per day (24-hour rotation) for ALL users

**Current State:**
- Celebrity matching shows all matched celebrities in separate tab
- No time-based rotation
- Displayed in separate Celebrity tab under Your Matches

**Target State:**
- Global celebrity of the day (all users see the SAME single celebrity)
- Only 1 celebrity total (not gender-based)
- Show to all users regardless of their match score with that celebrity
- Displayed at the TOP of "Your Matches" feed (not Live Matches)
- Distinguished styling (different color/highlight) to show it's not a student
- Automatic rotation at midnight
- Expires at end of day

---

### 3. Match Display Text Update 💬
**Requirement:** Change match display to show "You" instead of user's name

**Current State:**
- Match display shows: "Sarah matched with John (85%)"
- Uses both users' names in the display

**Target State:**
- Match display shows: "You matched with John (85%)"
- Current user is always referred to as "You"
- Only shows the other person's name

---

---

### Out of Scope for This Update

The following features from the original plan are NOT included in this update:

- ❌ University Tab Enhancement (rename to school name, remove labels)
- ❌ Match Commonality Messages (show what users have in common)
- ❌ Admin Panel - School Management
- ❌ Remove Celebrity Tab from Your Matches (already completed)

These may be implemented in future iterations if needed.

---

## Technical Implementation Plan (Updated 2025-11-18)

**Total Estimated Time:** 14 hours

---

### **TASK 1: Database Migration - Celebrity Daily Rotation** ⏱️ 2 hours

**Migration File:** `supabase/migrations/029_celebrity_daily_rotation.sql`

**Purpose:** Add fields to track featured celebrity and create automatic daily rotation

**New Table: `daily_celebrities`**
```sql
CREATE TABLE daily_celebrities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  male_celebrity_id uuid REFERENCES celebrities(id),
  female_celebrity_id uuid REFERENCES celebrities(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_daily_celebrities_date ON daily_celebrities(date);
```

**New Function: `get_daily_celebrity`**
```sql
CREATE OR REPLACE FUNCTION get_daily_celebrity(user_gender text)
RETURNS TABLE (
  celebrity_id uuid,
  celebrity_name text,
  celebrity_bio text,
  celebrity_image_path text,
  similarity_score real
) AS $$
  -- Returns opposite gender celebrity for current date
  -- Male users see female celebrity, female users see male celebrity
$$ LANGUAGE plpgsql;
```

#### 2.2 Backend API (4 hours)

**New Endpoint: `GET /api/matches/celebrity-of-day`**

Location: `/src/app/api/matches/celebrity-of-day/route.ts`

```typescript
export const GET = withSession(async ({ supabase, session }) => {
  // 1. Get user's gender from profile
  // 2. Check if daily_celebrities exists for today
  // 3. If not, create new entry (select random male + female)
  // 4. Return opposite gender celebrity
  // 5. Calculate similarity with user's face
  // 6. Return celebrity data with signed image URL
});
```

**Response:**
```json
{
  "celebrity": {
    "id": "uuid",
    "name": "Emma Watson",
    "bio": "British actress known for...",
    "image_url": "https://...",
    "similarity_score": 0.78,
    "expires_at": "2025-11-17T00:00:00Z"
  }
}
```

#### 2.3 Frontend - Live Matches Page (6 hours)

**Modify:** `/src/app/(authenticated)/live-matches/page.tsx`

**New Components:**
- `CelebrityOfTheDay` component (separate file)
  - Displays 1-2 celebrity cards with special styling
  - "Celebrity of the Day" header
  - Countdown timer to next celebrity
  - Smooth fade animations on celebrity change

**Layout:**
```
Live Matches Page
├─ Celebrity of the Day Section (top)
│  ├─ Header "Celebrity of the Day" 🌟
│  ├─ Celebrity Card (opposite gender)
│  └─ Countdown "New celebrity in 8h 23m"
└─ Match Feed (existing)
   └─ User match cards...
```

**API Integration:**
- Create `/src/features/matching/api/get-celebrity-of-day.ts`
- React Query hook: `useCelebrityOfTheDay()`
- Cache for 1 hour, refetch on window focus

#### 2.4 Background Job - Daily Celebrity Selection (2 hours)

**Options:**
1. Supabase pg_cron extension (recommended for simplicity)
2. Serverless cron job (Vercel Cron)
3. External cron service

**Implementation (pg_cron):**
```sql
SELECT cron.schedule(
  'select-daily-celebrities',
  '0 0 * * *', -- Run at midnight UTC
  $$
  INSERT INTO daily_celebrities (date, male_celebrity_id, female_celebrity_id)
  SELECT
    CURRENT_DATE,
    (SELECT id FROM celebrities WHERE gender = 'male' ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM celebrities WHERE gender = 'female' ORDER BY RANDOM() LIMIT 1)
  ON CONFLICT (date) DO NOTHING;
  $$
);
```

---

### **TASK 3: Rename University Tab** ⏱️ 3 hours

#### 3.1 Dynamic Tab Label (2 hours)

**Files:**
- `/src/app/(authenticated)/your-matches/page.tsx`
- `/src/features/matching/components/user-match/user-match.tsx`

**Changes:**
1. Fetch user's school from profile (already available via `useUser()`)
2. Replace hardcoded "University" with dynamic school name
3. Fallback to "University" if school is null/empty

**Code Example:**
```typescript
const user = useUser();
const schoolName = user?.school || "University";

const tabs = [
  { value: "university", label: schoolName }, // "Columbia University"
];
```

#### 3.2 Remove School Labels from Match Cards (1 hour)

**File:** `/src/features/matching/components/user-match/university-match/university-match-card.tsx`

**Changes:**
- Remove school display from lines ~101, ~186
- Keep only name and age in card layout
- Adjust spacing/layout after removal

**Before:**
```
John Doe, 22
Columbia University
```

**After:**
```
John Doe, 22
```

---

### **TASK 4: Match Commonality Messages** ⏱️ 12 hours

#### 4.1 Database Function (3 hours)

**New Function: `get_match_commonalities`**

Location: Database migration

```sql
CREATE OR REPLACE FUNCTION get_match_commonalities(
  face_id_1 uuid,
  face_id_2 uuid
)
RETURNS jsonb AS $$
DECLARE
  face1 record;
  face2 record;
  commonalities jsonb := '[]'::jsonb;
BEGIN
  -- Fetch both faces with attributes
  SELECT * INTO face1 FROM faces WHERE id = face_id_1;
  SELECT * INTO face2 FROM faces WHERE id = face_id_2;

  -- Check age similarity (within 2 years)
  IF ABS(face1.age - face2.age) <= 2 THEN
    commonalities := commonalities || jsonb_build_object(
      'type', 'age',
      'message', 'similar age'
    );
  END IF;

  -- Check facial geometry match (>80%)
  IF (face1.geometry_ratios <-> face2.geometry_ratios) > 0.8 THEN
    commonalities := commonalities || jsonb_build_object(
      'type', 'geometry',
      'message', 'similar facial features',
      'score', (face1.geometry_ratios <-> face2.geometry_ratios)
    );
  END IF;

  -- Check symmetry similarity
  IF ABS(face1.symmetry_score - face2.symmetry_score) < 0.1 THEN
    commonalities := commonalities || jsonb_build_object(
      'type', 'symmetry',
      'message', 'similar facial symmetry'
    );
  END IF;

  -- Check skin tone similarity
  IF (face1.skin_tone <-> face2.skin_tone) > 0.85 THEN
    commonalities := commonalities || jsonb_build_object(
      'type', 'skin_tone',
      'message', 'similar skin tone'
    );
  END IF;

  -- Check expression match
  IF face1.expression = face2.expression THEN
    commonalities := commonalities || jsonb_build_object(
      'type', 'expression',
      'message', format('both have %s expressions', face1.expression)
    );
  END IF;

  RETURN commonalities;
END;
$$ LANGUAGE plpgsql;
```

#### 4.2 Backend API Updates (2 hours)

**Modify Endpoints:**
- `GET /api/matches/top` - Add `commonalities` field to response
- `GET /api/matches/for-image` - Add `commonalities` field to response

**Changes:**
```typescript
// In match query, add commonalities calculation
const { data: matches } = await supabase.rpc('get_matches_with_commonalities', {
  user_face_id: faceId,
  limit: 20
});

// Response includes:
{
  match_id: "uuid",
  me: { ... },
  other: { ... },
  similarity_score: 0.85,
  commonalities: [
    { type: "age", message: "similar age" },
    { type: "geometry", message: "similar facial features", score: 0.87 }
  ]
}
```

#### 4.3 Message Generation Utility (3 hours)

**New File:** `/src/features/matching/utils/generate-match-message.ts`

```typescript
export interface Commonality {
  type: 'age' | 'geometry' | 'symmetry' | 'skin_tone' | 'expression';
  message: string;
  score?: number;
}

export function generateMatchMessage(commonalities: Commonality[]): string {
  if (!commonalities || commonalities.length === 0) {
    return "It's a match!";
  }

  // Prioritize messages
  const messages = commonalities.map(c => c.message);

  if (messages.length === 1) {
    return `It's a match! You both have ${messages[0]}.`;
  }

  if (messages.length === 2) {
    return `It's a match! You both have ${messages[0]} and ${messages[1]}.`;
  }

  // 3+ commonalities
  const lastMessage = messages.pop();
  return `It's a match! You both have ${messages.join(', ')}, and ${lastMessage}.`;
}

// Example outputs:
// "It's a match! You both have similar age and similar facial features."
// "It's a match! You both have similar facial symmetry, similar skin tone, and happy expressions."
```

#### 4.4 Display in Baby Generator (4 hours)

**Modify:** `/src/features/matching/components/user-match/university-match/baby-generator.tsx`

**Changes:**
1. Fetch commonalities when dialog opens
2. Pass commonalities to message generator
3. Display enhanced message on mutual match
4. Update toast notification with commonalities

**Implementation:**
```typescript
// Fetch match details with commonalities
const { data: matchDetails } = useMatchDetails(matchId);

// On baby generation success
onSuccess: (data) => {
  if (data.mutual_connection) {
    const message = generateMatchMessage(matchDetails.commonalities);
    toast.success(`${message} Chat unlocked! 💬`);
    setShowMutualDialog(true);
  }
}

// In mutual connection dialog
<Dialog>
  <DialogTitle>It's a Match! 🎉</DialogTitle>
  <DialogDescription>
    {generateMatchMessage(matchDetails.commonalities)}
    <br />
    Chat is now unlocked!
  </DialogDescription>
</Dialog>
```

---

### **TASK 5: Admin Panel - School Management** ⏱️ 8 hours

#### 5.1 Backend API (2 hours)

**New Endpoint: `GET /api/admin/schools`**

Location: `/src/app/api/admin/schools/route.ts`

```typescript
export const GET = withSession(async ({ supabase, session }) => {
  // Verify admin role
  if (session.profile.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Query schools with statistics
  const { data: schools } = await supabase.rpc('get_school_statistics');

  return NextResponse.json({ schools });
});
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION get_school_statistics()
RETURNS TABLE (
  school text,
  total_users bigint,
  active_users_7d bigint,
  total_matches bigint
) AS $$
  SELECT
    p.school,
    COUNT(DISTINCT p.id) as total_users,
    COUNT(DISTINCT CASE
      WHEN p.last_seen > NOW() - INTERVAL '7 days' THEN p.id
    END) as active_users_7d,
    COUNT(DISTINCT m.id) as total_matches
  FROM profiles p
  LEFT JOIN matches m ON (m.user_id = p.id OR m.matched_user_id = p.id)
  WHERE p.school IS NOT NULL AND p.school != ''
  GROUP BY p.school
  ORDER BY total_users DESC;
$$ LANGUAGE sql;
```

#### 5.2 Admin Page UI (6 hours)

**New Page:** `/src/app/(authenticated)/admin/schools/page.tsx`

**Components:**
- School statistics table with sorting
- Search/filter by school name
- Export to CSV functionality
- Responsive design

**Layout:**
```tsx
export default function SchoolsAdminPage() {
  const { data: schools } = useSchoolStatistics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">School Management</h1>
        <Button onClick={exportToCSV}>Export CSV</Button>
      </div>

      <Input
        placeholder="Search schools..."
        onChange={handleSearch}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>School Name</TableHead>
            <TableHead>Total Users</TableHead>
            <TableHead>Active (7d)</TableHead>
            <TableHead>Total Matches</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map(school => (
            <TableRow key={school.school}>
              <TableCell>{school.school}</TableCell>
              <TableCell>{school.total_users}</TableCell>
              <TableCell>{school.active_users_7d}</TableCell>
              <TableCell>{school.total_matches}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Update Admin Sidebar:**
- Add "Schools" link to `/src/app/(authenticated)/admin/layout.tsx`
- Icon: GraduationCap or School

---

## Testing Strategy

### Unit Tests
- [ ] Message generation utility (all commonality combinations)
- [ ] Celebrity selection logic (random, gender filtering)
- [ ] School statistics query (accurate counts)

### Integration Tests
- [ ] Celebrity of the day rotation (midnight trigger)
- [ ] Match commonalities displayed correctly
- [ ] Admin school stats match actual data

### E2E Tests
- [ ] Mobile: Your Matches shows only University tab
- [ ] Desktop: Celebrity section appears in Live Matches
- [ ] Match dialog shows commonality message
- [ ] Admin can view school statistics

### Manual Testing
- [ ] Test on iOS Safari (mobile flow)
- [ ] Test on Android Chrome (mobile flow)
- [ ] Test on Desktop Chrome (both flows)
- [ ] Test with different user genders (celebrity matching)
- [ ] Test with various schools (tab renaming)
- [ ] Test match generation (commonality messages)
- [ ] Test admin panel access (role verification)

---

## Timeline

### **Week 1 (40 hours)**
- **Day 1-2:** Task 1 (Remove Celebrity Tab) + Task 3 (Rename Tab) = 5 hours
- **Day 3-5:** Task 2 (Celebrity of the Day) = 16 hours
- **Day 5:** Task 5 (Admin School Management) = 8 hours
- **Remaining:** Task 4 start (Match Messages) = 11 hours

### **Week 2 (20 hours)**
- **Day 1-2:** Task 4 complete (Match Messages) = 1 hour
- **Day 3-5:** Testing, bug fixes, polish = 19 hours

### **Week 3 (Buffer)**
- Final testing on mobile + desktop
- Client feedback incorporation
- Deployment preparation

**Total Estimated Effort:** 41 hours (~2 weeks with buffer)

---

## Technical Risks & Mitigation

### Risk 1: Celebrity Rotation Reliability
**Risk:** Midnight cron job may fail, leaving no celebrity for the day

**Mitigation:**
- Implement fallback in API: if no daily celebrity exists, create one on-demand
- Add monitoring/alerting for cron job failures
- Keep previous day's celebrity as fallback

### Risk 2: Limited Commonality Data
**Risk:** Not all users have rich facial attribute data

**Mitigation:**
- Graceful degradation: show generic message if no commonalities found
- Default message: "It's a match! Chat unlocked! 💬"
- Ensure commonality detection handles null/missing data

### Risk 3: School Name Inconsistencies
**Risk:** Free-form school names may have typos/variations

**Mitigation:**
- Document known issue for future normalization
- Admin can view all variations in school stats
- Consider fuzzy matching for school grouping (future)

---

## Out of Scope (Future Enhancements)

### Not Included in This Release:
- ❌ Eye color detection (requires new AI model)
- ❌ Hair color detection
- ❌ Face shape classification
- ❌ Multiple school tabs with filtering
- ❌ School approval/verification workflow
- ❌ School normalization/deduplication
- ❌ Admin school CRUD operations (add/edit/delete)
- ❌ Per-school feature toggles
- ❌ Celebrity curation/voting system

### Recommended for Next Phase:
1. **School Normalization:** Create `schools` table, migrate existing data
2. **Enhanced Attributes:** Integrate additional AI models for eye/hair color
3. **Celebrity Curation:** Admin UI to approve/remove celebrities
4. **Advanced Filtering:** Multi-school feeds, category filters

---

## Deployment Checklist

### Pre-Deployment:
- [ ] All migrations tested in staging environment
- [ ] pg_cron extension enabled in production Supabase
- [ ] Celebrity images accessible via CDN
- [ ] Admin role assigned to authorized users
- [ ] Environment variables updated (if any new ones)

### Deployment Steps:
1. [ ] Apply database migrations (in order)
2. [ ] Deploy Next.js application (frontend + API routes)
3. [ ] Verify pg_cron job scheduled
4. [ ] Manually trigger first celebrity selection
5. [ ] Test all endpoints in production
6. [ ] Monitor logs for errors

### Post-Deployment:
- [ ] Test mobile app flow (remove Celebrity tab verified)
- [ ] Verify celebrity of the day displays correctly
- [ ] Confirm match messages show commonalities
- [ ] Check admin school statistics accuracy
- [ ] Monitor performance metrics
- [ ] Gather user feedback

---

## Success Metrics

### User Experience:
- 📱 Mobile flow simplified (single feed focus)
- 🌟 Celebrity engagement (daily views/interactions)
- 💬 Match message relevance (user feedback)
- 🎓 School tab clarity (reduced confusion)

### Technical:
- ⚡ Celebrity API response time < 200ms
- 🔄 Celebrity rotation 100% uptime
- 📊 Admin school stats load time < 500ms
- 🐛 Zero critical bugs in first week

### Business:
- 📈 Increased user retention (simplified UX)
- 💬 Higher chat unlock rate (better match messages)
- 👥 Admin efficiency (school management tools)

---

## Related Documentation

- [Project Architecture](../system/project_architecture.md)
- [Database Schema](../system/database_schema.md)
- [API Organization SOP](../sop/api-organization.md)
- [Animations SOP](../sop/animations.md)

---

**Last Updated:** 2025-11-16
**Document Owner:** Engineering Team
**Client Approval:** Pending implementation
