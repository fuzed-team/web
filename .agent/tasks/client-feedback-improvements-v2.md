# Client Feedback Improvements - Phase 2

**Status:** 🚧 In Progress
**Created:** 2025-11-18
**Updated:** 2025-11-18 (Corrected deprecated code)
**Priority:** High (Pre-launch requirement)

---

## ⚠️ Important Update (2025-11-18)

**CORRECTED:** Removed deprecated `calculate_cosine_similarity` function reference.

**Current System Uses:**
- ✅ `calculate_advanced_similarity()` - 6-factor weighted algorithm (embedding 20%, geometry 20%, age 15%, symmetry 15%, skin_tone 15%, expression 15%)
- ✅ `find_celebrity_matches_advanced()` - RPC function for celebrity matching
- ✅ Pre-computed matches in `celebrity_matches` table

**What Changed:**
- Line 183-186: Replaced deprecated RPC call with `find_celebrity_matches_advanced()`
- Now uses current advanced matching algorithm with 14 face attributes

---

## Overview

Client has requested focused changes to simplify the matching experience:
1. **Remove Live Matches** - Users should ONLY see their own matches
2. **Single Celebrity of the Day** - One celebrity displayed to all users daily
3. **Match Display Update** - Show "You matched with X" instead of names
4. **Celebrity Location** - Display at top of Your Matches feed

---

## Requirements

### 1. Remove Live Matches Page 🚫

**Current State:**
- `/live-matches` page shows ALL user-to-user matches across platform
- Users can see other people's matches (e.g., "Sarah matched with John (85%)")
- Accessible via navigation

**Target State:**
- Remove live-matches from navigation
- Comment out page route (keep code for future)
- Users can ONLY see "Your Matches"
- Backend `/api/matches/top` endpoint remains functional but unused

---

### 2. Celebrity of the Day 🌟

**Current State:**
- Celebrity tab shows all matched celebrities
- No daily rotation
- Separate tab in Your Matches

**Target State:**
- ONE celebrity for ALL users per day (not gender-based)
- Same celebrity shown to everyone regardless of match score
- Display at TOP of Your Matches feed
- Distinguished styling (gradient/border) - clearly not a student
- Auto-rotation at midnight
- Expires after 24 hours

---

### 3. Match Display Text 💬

**Current State:**
- Shows: "Sarah matched with John (85%)"

**Target State:**
- Shows: "You matched with John (85%)"
- Current user always referred to as "You"

---

## Technical Implementation

### TASK 1: Database Migration (2 hours)

**File:** `supabase/migrations/029_celebrity_daily_rotation.sql`

**Schema Changes:**
```sql
-- Add rotation fields to celebrities table
ALTER TABLE celebrities
  ADD COLUMN is_featured BOOLEAN DEFAULT false,
  ADD COLUMN featured_from TIMESTAMPTZ,
  ADD COLUMN featured_until TIMESTAMPTZ;

-- Index for performance
CREATE INDEX idx_celebrities_featured
  ON celebrities(is_featured, featured_until)
  WHERE is_featured = true;

-- Function to rotate daily celebrity
CREATE OR REPLACE FUNCTION rotate_daily_celebrity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Unfeature all celebrities
  UPDATE celebrities SET is_featured = false;

  -- Select ONE random celebrity and feature for 24 hours
  UPDATE celebrities SET
    is_featured = true,
    featured_from = NOW(),
    featured_until = NOW() + INTERVAL '1 day'
  WHERE id = (
    SELECT id FROM celebrities
    WHERE embedding IS NOT NULL
    ORDER BY RANDOM()
    LIMIT 1  -- Only 1 celebrity for all users
  );
END;
$$;

-- Schedule daily rotation at midnight UTC
SELECT cron.schedule(
  'rotate-daily-celebrity',
  '0 0 * * *',
  $$SELECT rotate_daily_celebrity();$$
);

-- Initialize first celebrity
SELECT rotate_daily_celebrity();
```

**Testing:**
- [ ] Run migration locally
- [ ] Verify `is_featured` column added
- [ ] Test `rotate_daily_celebrity()` function manually
- [ ] Verify only 1 celebrity featured at a time
- [ ] Confirm cron job scheduled

---

### TASK 2: Backend API Endpoint (3 hours)

**File:** `src/app/api/matches/celebrity/featured/route.ts` (NEW)

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's profile and active face
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, faces!inner(id, embedding, image_path)')
    .eq('user_id', user.id)
    .single()

  if (!profile?.faces?.[0]) {
    return NextResponse.json({ error: 'No face uploaded' }, { status: 400 })
  }

  const userFace = profile.faces[0]

  // Get today's featured celebrity
  const { data: celebrity, error: celebError } = await supabase
    .from('celebrities')
    .select('*')
    .eq('is_featured', true)
    .gte('featured_until', new Date().toISOString())
    .single()

  if (celebError || !celebrity) {
    return NextResponse.json({ error: 'No celebrity featured today' }, { status: 404 })
  }

  // Check if match already exists in celebrity_matches table
  // (Pre-computed using 6-factor advanced algorithm)
  let { data: existingMatch } = await supabase
    .from('celebrity_matches')
    .select('similarity_score')
    .eq('face_id', userFace.id)
    .eq('celebrity_id', celebrity.id)
    .maybeSingle()

  let similarityScore = existingMatch?.similarity_score

  // Calculate match on-demand if not exists
  // Uses advanced matching algorithm (embedding 20%, geometry 20%, age 15%,
  // symmetry 15%, skin_tone 15%, expression 15%)
  if (!similarityScore) {
    const { data: rpcMatches } = await supabase.rpc(
      'find_celebrity_matches_advanced',
      {
        query_face_id: userFace.id,
        user_gender: profile.gender,
        match_threshold: 0.0, // Get any score, even low matches
        match_count: 50 // Get top 50 to ensure we find featured celebrity
      }
    )

    // Find the featured celebrity in results
    const celebrityMatch = rpcMatches?.find(m => m.id === celebrity.id)
    similarityScore = celebrityMatch?.similarity || 0.5

    // Store the match for future queries
    if (celebrityMatch) {
      await supabase.from('celebrity_matches').insert({
        face_id: userFace.id,
        celebrity_id: celebrity.id,
        similarity_score: similarityScore
      })
    }
  }

  return NextResponse.json({
    celebrity: {
      id: celebrity.id,
      name: celebrity.name,
      bio: celebrity.bio,
      category: celebrity.category,
      image_path: celebrity.image_path,
      featured_until: celebrity.featured_until,
    },
    similarity_score: similarityScore || 0.5,
    is_featured: true,
  })
}
```

**API Response:**
```json
{
  "celebrity": {
    "id": "uuid",
    "name": "Emma Watson",
    "bio": "British actress...",
    "category": "actor",
    "image_path": "/celebrity-images/...",
    "featured_until": "2025-11-19T00:00:00Z"
  },
  "similarity_score": 0.78,
  "is_featured": true
}
```

**Testing:**
- [ ] Test endpoint with authenticated user
- [ ] Test with user who has no face
- [ ] Test when no celebrity featured
- [ ] Test match score calculation
- [ ] Verify response format

---

### TASK 3: Remove Live Matches Navigation (1 hour)

**Files to Modify:**
1. Find navigation component (likely `src/components/layout/sidebar.tsx` or similar)
2. Find mobile navigation/tabs

**Changes:**
- Remove link/tab to `/live-matches`
- Keep only "Your Matches" link in navigation
- Remove any icons/labels for Live Matches

**Testing:**
- [ ] Verify navigation no longer shows Live Matches
- [ ] Verify direct URL access shows 404 or redirects
- [ ] Test on mobile and desktop
- [ ] Check no broken links

---

### TASK 4: Comment Out Live Matches Page (30 min)

**File:** `src/app/(authenticated)/live-matches/page.tsx`

**Changes:**
```typescript
// COMMENTED OUT 2025-11-18: Per client request, removed public live matches feed
// Users should only see their own matches
// Keeping code for potential future use

/*
export default function LiveMatchesPage() {
  // ... entire page code
}
*/

// Temporarily redirect to Your Matches
export default function LiveMatchesPage() {
  redirect('/your-matches')
}
```

**Keep Components:** (for future use)
- `src/features/matching/components/live-match/live-match.tsx`
- `src/features/matching/components/live-match/match-card.tsx`
- `src/features/matching/components/live-match/head-card.tsx`

**Testing:**
- [ ] Accessing `/live-matches` redirects to `/your-matches`
- [ ] No console errors
- [ ] Components still exist in codebase

---

### TASK 5: Update Match Display Text (1 hour)

**File:** `src/features/matching/components/user-match/university-match/university-match-card.tsx`

**Find and Replace:**
- Current pattern: Shows both user names
- New pattern: Show "You" for current user

**Implementation:**
```typescript
// Example change (exact location will vary):
// Before:
const displayText = `${meProfile.name} matched with ${otherProfile.name}`

// After:
const displayText = `You matched with ${otherProfile.name}`
```

**Testing:**
- [ ] All match cards show "You matched with X"
- [ ] Percentage displays correctly
- [ ] No broken layouts
- [ ] Test on mobile and desktop

---

### TASK 6: Create Celebrity of the Day Component (3 hours)

**File:** `src/features/matching/components/celebrity-of-the-day/celebrity-of-the-day-card.tsx` (NEW)

**Implementation:**
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getMatchPercentage } from '@/lib/utils/match-percentage'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface FeaturedCelebrity {
  celebrity: {
    id: string
    name: string
    bio: string
    category: string
    image_path: string
    featured_until: string
  }
  similarity_score: number
  is_featured: boolean
}

async function fetchFeaturedCelebrity(): Promise<FeaturedCelebrity> {
  const response = await fetch('/api/matches/celebrity/featured')
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error('Failed to fetch featured celebrity')
  }
  return response.json()
}

export function CelebrityOfTheDayCard() {
  const [timeLeft, setTimeLeft] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-celebrity'],
    queryFn: fetchFeaturedCelebrity,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!data?.celebrity?.featured_until) return

    const updateTimer = () => {
      const now = Date.now()
      const end = new Date(data.celebrity.featured_until).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m left`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [data])

  if (isLoading) {
    return (
      <Card className="mb-4 animate-pulse bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="p-6">
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (error || !data) return null

  const matchPercentage = getMatchPercentage(data.similarity_score)

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold">
            ⭐ Celebrity of the Day
          </Badge>
          <span className="text-sm text-purple-700 font-medium">
            {timeLeft}
          </span>
        </div>

        {/* Content */}
        <div className="flex gap-6 items-center">
          {/* Celebrity Image */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-xl">
            <Image
              src={data.celebrity.image_path}
              alt={data.celebrity.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {data.celebrity.name}
            </h3>
            <p className="text-sm text-purple-600 font-medium capitalize mb-2">
              {data.celebrity.category}
            </p>

            {/* Match Score */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-purple-600">
                {matchPercentage}%
              </span>
              <span className="text-sm text-gray-600">Match</span>
            </div>

            {/* Bio */}
            {data.celebrity.bio && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {data.celebrity.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
```

**Styling Features:**
- Gradient background (purple to pink)
- Bold border to distinguish from regular matches
- Badge clearly labels as "Celebrity of the Day"
- Countdown timer showing expiration
- Larger image with shadow effect
- Match percentage prominently displayed

**Testing:**
- [ ] Component renders correctly
- [ ] Countdown timer updates
- [ ] Gradient styling distinct from student matches
- [ ] Image loads correctly
- [ ] Handles no celebrity gracefully
- [ ] Responsive on mobile

---

### TASK 7: Add Celebrity to Your Matches Page (1 hour)

**File:** `src/app/(authenticated)/your-matches/page.tsx`

**Changes:**
```typescript
import { CelebrityOfTheDayCard } from '@/features/matching/components/celebrity-of-the-day/celebrity-of-the-day-card'
import { UserMatch } from '@/features/matching/components/user-match/user-match'

export default function YourMatchesPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>

      {/* Celebrity of the Day - Always at top */}
      <CelebrityOfTheDayCard />

      {/* User's regular matches */}
      <UserMatch />
    </div>
  )
}
```

**Layout:**
```
Your Matches Page
├─ Celebrity of the Day Card (top, distinguished styling)
└─ User Match List (regular student matches)
```

**Testing:**
- [ ] Celebrity appears at top
- [ ] Clearly visually distinct from student matches
- [ ] Page loads without errors
- [ ] Scrolling works correctly
- [ ] Mobile layout looks good

---

### TASK 8: Add Types (30 min)

**File:** `src/types/api.ts` (or create if doesn't exist)

```typescript
export interface FeaturedCelebrity {
  celebrity: {
    id: string
    name: string
    bio: string
    category: string
    gender: string
    image_path: string
    featured_until: string
  }
  similarity_score: number
  is_featured: boolean
}
```

---

## Testing Checklist

### Database
- [ ] Migration runs successfully
- [ ] `is_featured`, `featured_from`, `featured_until` columns added
- [ ] `rotate_daily_celebrity()` function works
- [ ] Only 1 celebrity featured at a time
- [ ] pg_cron job scheduled
- [ ] Function can be manually triggered

### Backend API
- [ ] `/api/matches/celebrity/featured` returns celebrity
- [ ] Handles unauthorized requests (401)
- [ ] Handles no face uploaded (400)
- [ ] Handles no celebrity featured (404)
- [ ] Calculates match score on-demand
- [ ] Stores new matches in database
- [ ] Response format correct

### Frontend - Navigation
- [ ] Live Matches removed from navigation
- [ ] `/live-matches` URL redirects to `/your-matches`
- [ ] No broken links
- [ ] Mobile navigation updated
- [ ] Desktop navigation updated

### Frontend - Match Display
- [ ] All matches show "You matched with X"
- [ ] Match percentage displays correctly
- [ ] Layout not broken
- [ ] Works on mobile and desktop

### Frontend - Celebrity Component
- [ ] Component renders on Your Matches page
- [ ] Appears at top of feed
- [ ] Distinguished styling (gradient, border)
- [ ] Countdown timer works
- [ ] Image loads correctly
- [ ] Match percentage displays
- [ ] Handles no celebrity gracefully
- [ ] Loading state shows
- [ ] Error state handled
- [ ] Responsive design

### Integration
- [ ] Celebrity rotates at midnight (or manual trigger)
- [ ] All users see same celebrity
- [ ] Match score calculated for each user
- [ ] Expires after 24 hours
- [ ] New celebrity appears next day

### Performance
- [ ] API response < 200ms
- [ ] Page load time acceptable
- [ ] No memory leaks (timer cleanup)
- [ ] Images optimized

---

## Deployment Steps

### Pre-Deployment
1. [ ] Test all changes in local environment
2. [ ] Review PR and get approval
3. [ ] Ensure pg_cron enabled in Supabase production
4. [ ] Backup database

### Deployment
1. [ ] Apply migration to production database
2. [ ] Deploy Next.js application
3. [ ] Verify pg_cron job scheduled
4. [ ] Manually trigger first celebrity: `SELECT rotate_daily_celebrity();`
5. [ ] Test all endpoints in production
6. [ ] Monitor logs for errors

### Post-Deployment
1. [ ] Test on production URL
2. [ ] Verify celebrity displays correctly
3. [ ] Verify live-matches redirects
4. [ ] Verify match text shows "You matched with X"
5. [ ] Check analytics/monitoring
6. [ ] Gather user feedback

---

## Rollback Plan

If critical issues arise:

1. **Frontend Only Issues:**
   - Comment out `<CelebrityOfTheDayCard />` in Your Matches page
   - Redeploy frontend

2. **API Issues:**
   - Return 503 from `/api/matches/celebrity/featured`
   - Frontend will gracefully hide component

3. **Database Issues:**
   ```sql
   -- Disable cron job
   SELECT cron.unschedule('rotate-daily-celebrity');

   -- Unfeature all celebrities
   UPDATE celebrities SET is_featured = false;
   ```

4. **Full Rollback:**
   - Revert git commit
   - Redeploy previous version
   - Optionally drop new columns (not required)

---

## Success Criteria

✅ **Feature is successful when:**
- Live Matches page is inaccessible
- Navigation no longer shows Live Matches link
- All match text shows "You matched with X (85%)"
- Celebrity of the Day appears at top of Your Matches
- Celebrity has distinguished styling (clearly not a student)
- Only 1 celebrity shows for all users
- Celebrity rotates automatically at midnight
- Match percentage displays for each user
- Mobile and desktop UX is smooth
- No performance degradation

---

## Timeline

**Total Estimated Effort:** ~14 hours

**Day 1 (4 hours):**
- Database migration
- Backend API endpoint

**Day 2 (4 hours):**
- Remove live matches navigation
- Comment out page
- Update match display text

**Day 3 (4 hours):**
- Create celebrity component
- Add to Your Matches page
- Add types

**Day 4 (2 hours):**
- Testing
- Bug fixes
- Deployment

---

## Notes

- Backend `/api/matches/top` endpoint remains functional but unused
- All live-match component files preserved (for potential future use)
- Celebrity rotation fully automated via pg_cron
- Match scores calculated using existing cosine similarity
- UI clearly distinguishes celebrity from students
- No gender-based filtering (one celebrity for everyone)

---

**Last Updated:** 2025-11-18
**Status:** Ready for Implementation
