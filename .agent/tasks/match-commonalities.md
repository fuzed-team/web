# Match Commonalities Display Feature

## Overview
Display facial feature commonalities (age, facial geometry, skin tone, symmetry, expression) when matched users start chatting, helping them break the ice with conversation starters based on "hard facts" detected by the AI.

## Customer Feedback
> "When both users match (guy and girl), then it needs to show what the algorithm found they had in common, like eye color, facial features, and so on, so they can start off the conversation based on these 'hard' fact"

## Current State Analysis

### What Already Exists ✅

#### 1. Facial Attribute Extraction
- **File**: `src/lib/services/ai-service.ts`
- **Service**: Replicate API with custom Cog model `ngocla99/face-analysis`
- **Extracted Features** (15+ attributes):
  - Demographics: age, gender
  - Appearance: skin_tone (CIELAB color space)
  - Geometry: face proportions, eye spacing, jawline width
  - Expression: 7 emotions (happy, neutral, sad, angry, surprise, fear, disgust)
  - Quality: symmetry_score, blur_score, illumination
  - Structure: 68 facial landmarks, pose (yaw, pitch, roll)

#### 2. Database Storage
- **Table**: `faces` (migration 018)
- **Stored Attributes**: All facial features indexed for fast querying
- **Performance**: Composite indexes on age, gender, quality_score, expression

#### 3. Commonalities Detection Function
- **File**: `supabase/migrations/027_get_match_commonalities.sql`
- **Function**: `get_match_commonalities(face_id_1, face_id_2)`
- **Detects 5 Types**:
  1. **Age Similarity**: Within 2 years
  2. **Facial Geometry**: Similar proportions (face width/height, eye spacing, jawline, nose width)
  3. **Symmetry**: Within 0.1 on 0-1 scale
  4. **Skin Tone**: CIELAB Delta E < 10 (perceptually similar)
  5. **Expression**: Same dominant emotion

**Returns**:
```json
[
  {
    "type": "age",
    "message": "similar age",
    "detail": "25 and 26 years old"
  },
  {
    "type": "skin_tone",
    "message": "similar skin tone",
    "detail": "skin tone difference: 7.32 (very close)"
  }
]
```

#### 4. API Integration
- **Endpoint**: `GET /api/matches/[matchId]`
- **File**: `src/app/api/matches/[matchId]/route.ts` (lines 64-75)
- **Already returns**: `{ match, commonalities }`

#### 5. Frontend Infrastructure
- **Hook**: `useMatchDetails()` in `src/features/matching/api/get-match-details.ts`
- **Utilities**: `src/features/matching/utils/generate-match-message.ts`
  - `generateMatchMessage()` - Natural language generation
  - `generateShortSummary()` - Short summary
  - `prioritizeCommonalities()` - Sort by importance

#### 6. Current Usage
- **File**: `src/features/matching/components/match-dialog/baby-generator.tsx` (lines 82-86)
- **Usage**: Toast message only
- **Example**: "It's a match! You both have similar age and similar facial features. Chat unlocked! 💬"

### What's Missing ⚠️

#### Problem
The commonalities data exists and is fetched, but **NOT displayed in the chat UI** where users start conversations. Users can't see what they have in common to break the ice.

#### Gap Analysis
1. **Connections API** doesn't include match_id or commonalities
2. **TypeScript types** don't include commonalities in MutualConnection
3. **No UI components** to display commonalities badges
4. **Chat header** doesn't show commonalities
5. **Connection list** doesn't indicate commonalities

---

## Implementation Plan

### Phase 1: Backend Updates (30 min)

#### Task 1.1: Update Connections API
**File**: `src/app/api/connections/route.ts`

**Changes**:
```typescript
// Line ~142-160: In the connections.map() transform
const connections = await Promise.all(
  connectionsData.map(async (conn) => {
    // Fetch match details to get face IDs
    const { data: match } = await supabase
      .from("matches")
      .select("face_a_id, face_b_id")
      .eq("id", conn.match_id)
      .single();

    // Fetch commonalities
    const { data: commonalities } = await supabase.rpc(
      "get_match_commonalities",
      {
        face_id_1: match.face_a_id,
        face_id_2: match.face_b_id,
      }
    );

    return {
      id: conn.id,
      match_id: conn.match_id,  // ADD THIS
      commonalities: commonalities || [],  // ADD THIS
      other_user: { ... },
      baby_image: conn.baby?.image_url,
      last_message: { ... },
      unread_count: unreadCount,
    };
  })
);
```

**Performance Note**: Consider fetching all commonalities in a single query if this causes N+1 issues.

#### Task 1.2: Update TypeScript Types
**File**: `src/features/chat/types/index.ts`

**Changes**:
```typescript
// Import Commonality type from matching feature
import type { Commonality } from "@/features/matching/types";

export interface MutualConnection {
  id: string;
  match_id: string;  // ADD THIS
  commonalities: Commonality[];  // ADD THIS
  other_user: {
    id: string;
    name: string;
    profile_image: string | null;
    is_online: boolean;
    last_seen: string | null;
  };
  baby_image: string | null;
  last_message: {
    content: string;
    created_at: string;
    is_from_me: boolean;
  } | null;
  unread_count: number;
}
```

**Verify**: Check if `Commonality` type already exists in `src/features/matching/types/index.ts`

---

### Phase 2: UI Components (1-2 hours)

#### Task 2.1: Create CommonalitiesBadge Component
**New File**: `src/features/matching/components/commonalities-badge.tsx`

**Purpose**: Display commonalities as compact badges with icons

**Props**:
```typescript
interface CommonalitiesBadgeProps {
  commonalities: Commonality[];
  variant?: "compact" | "full";
  className?: string;
}
```

**Design Specs**:
- **Icons**:
  - `age`: 👥 or `<Users />` from lucide-react
  - `expression`: 🎭 or `<Smile />`
  - `symmetry`: 🌟 or `<Sparkles />`
  - `skin_tone`: 🎨 or `<Palette />`
  - `geometry`: ✨ or `<Target />`

- **Compact Variant**: Icons only, small size
- **Full Variant**: Icon + label, tooltip with detail

**Example Output**:
```tsx
// Compact
<div className="flex gap-1">
  <Badge variant="secondary" size="sm">👥</Badge>
  <Badge variant="secondary" size="sm">🎭</Badge>
  <Badge variant="secondary" size="sm">🌟</Badge>
</div>

// Full
<div className="flex flex-wrap gap-2">
  <Badge variant="outline">
    <Users className="w-3 h-3 mr-1" />
    Similar age
  </Badge>
  <Badge variant="outline">
    <Smile className="w-3 h-3 mr-1" />
    Same expression
  </Badge>
</div>
```

**Implementation Notes**:
- Use existing Badge component from `@/components/ui/badge`
- Use Tooltip from `@/components/ui/tooltip` for details
- Follow color scheme from existing design system
- Add smooth animations (refer to `.agent/sop/animations.md`)

#### Task 2.2: Create CommonalitiesDetail Component
**New File**: `src/features/matching/components/commonalities-detail.tsx`

**Purpose**: Expanded view showing full commonalities with descriptions

**Props**:
```typescript
interface CommonalitiesDetailProps {
  commonalities: Commonality[];
  className?: string;
}
```

**Design Specs**:
- Card layout with list of commonalities
- Each item: Icon + Message + Detail
- Use existing `generateMatchMessage()` utility for header
- Collapsible/expandable (optional)

**Example Output**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>What You Have in Common</CardTitle>
    <CardDescription>
      {generateMatchMessage(commonalities)}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {commonalities.map((c) => (
        <div key={c.type} className="flex items-start gap-3">
          <div className="mt-0.5">{getIcon(c.type)}</div>
          <div>
            <p className="font-medium">{c.message}</p>
            <p className="text-sm text-muted-foreground">{c.detail}</p>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**Usage**: Display in chat header as expandable section or in a dialog

---

### Phase 3: Chat Integration (1 hour)

#### Task 3.1: Update Chat Header
**File**: `src/features/chat/components/chat-header.tsx`

**Changes** (after line ~30, below user name):
```tsx
import { CommonalitiesBadge } from "@/features/matching/components/commonalities-badge";

// Inside the component
<div className="flex-1 min-w-0">
  <h2 className="text-lg font-semibold truncate">{connection.other_user.name}</h2>

  {/* ADD THIS SECTION */}
  {connection.commonalities && connection.commonalities.length > 0 && (
    <div className="flex items-center gap-2 mt-1">
      <CommonalitiesBadge
        commonalities={connection.commonalities}
        variant="full"
      />
    </div>
  )}

  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    {/* Existing online status */}
  </div>
</div>
```

**Visual Design**:
```
┌─────────────────────────────────────────┐
│ [Avatar]  John Doe                      │
│           👥 Similar age  🎭 Same smile │
│           🟢 Online                     │
└─────────────────────────────────────────┘
```

#### Task 3.2: Update Connection Item
**File**: `src/features/chat/components/connection-item.tsx`

**Changes** (after last message preview, line ~60):
```tsx
{connection.last_message && (
  <p className="text-sm text-muted-foreground truncate">
    {connection.last_message.content}
  </p>
)}

{/* ADD THIS SECTION */}
{connection.commonalities && connection.commonalities.length > 0 && (
  <p className="text-xs text-muted-foreground mt-1">
    {connection.commonalities.length} thing
    {connection.commonalities.length !== 1 ? "s" : ""} in common
  </p>
)}
```

**Visual Design**:
```
┌─────────────────────────────────────────┐
│ [Avatar]  John Doe              [2]     │
│           Hey there!                    │
│           3 things in common            │
└─────────────────────────────────────────┘
```

**Alternative**: Show compact badges instead of text
```tsx
<div className="mt-1">
  <CommonalitiesBadge
    commonalities={connection.commonalities}
    variant="compact"
  />
</div>
```

---

### Phase 4: Polish & Testing (30 min)

#### Task 4.1: Handle Edge Cases
1. **No Commonalities**: Show generic "It's a match!" message
2. **Loading State**: Show skeleton for badges while fetching
3. **Null Attributes**: Function already handles this (returns empty array)
4. **Old Data**: Connections without commonalities (graceful degradation)

#### Task 4.2: Animations
**Reference**: `.agent/sop/animations.md`

Add smooth transitions:
```tsx
// Badge entrance animation
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <CommonalitiesBadge ... />
</motion.div>
```

#### Task 4.3: Tooltips
Add helpful explanations:
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Badge>👥 Similar age</Badge>
    </TooltipTrigger>
    <TooltipContent>
      <p>{commonality.detail}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Task 4.4: Testing Checklist
- [ ] Connections API returns commonalities
- [ ] TypeScript types compile without errors
- [ ] Badge component displays correctly in compact mode
- [ ] Badge component displays correctly in full mode
- [ ] Chat header shows commonalities
- [ ] Connection list shows commonality count
- [ ] No commonalities scenario works
- [ ] Loading states work smoothly
- [ ] Animations are smooth
- [ ] Tooltips show details
- [ ] Mobile responsive
- [ ] Performance: No N+1 queries in connections API

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Flow                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. User views match card (Live Match Feed)                      │
│    - See similarity percentage                                  │
│    - Click "View Baby"                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Baby Generator Dialog opens                                  │
│    - Fetches matchDetails (includes commonalities)              │
│    - Generates baby image                                       │
│    - Shows toast: generateMatchMessage(commonalities)           │
│    - Creates mutual_connection (if both generate baby)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. User navigates to Chat (Connections page)                    │
│    - GET /api/connections                                       │
│    - Returns: connections with commonalities                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Connection List (NEW)                                        │
│    - Shows: "3 things in common" badge                          │
│    - User clicks connection                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Chat Room opens (NEW)                                        │
│    - Chat Header displays: 👥 Similar age  🎭 Same smile        │
│    - User can see what they have in common                      │
│    - Conversation starter based on "hard facts"                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Reference

### Key Tables

#### `faces`
```sql
CREATE TABLE faces (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),

  -- Demographics
  age INTEGER,
  gender TEXT,

  -- Appearance
  skin_tone_lab NUMERIC[],  -- [L, a, b] in CIELAB

  -- Geometry
  geometry_ratios JSONB,  -- {face_width_height_ratio, eye_spacing, ...}

  -- Expression
  expression TEXT,  -- dominant emotion
  emotion_scores JSONB,  -- {happy: 0.8, neutral: 0.1, ...}

  -- Quality
  symmetry_score NUMERIC,
  quality_score NUMERIC,

  -- Advanced
  landmarks_68 JSONB,
  pose JSONB,
  embedding VECTOR(512)
);

CREATE INDEX idx_faces_attributes ON faces(age, gender, quality_score, expression);
```

#### `matches`
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  face_a_id UUID REFERENCES faces(id),
  face_b_id UUID REFERENCES faces(id),
  similarity_score FLOAT8,  -- 0.0-1.0
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `mutual_connections`
```sql
CREATE TABLE mutual_connections (
  id UUID PRIMARY KEY,
  profile_a_id UUID REFERENCES profiles(id),
  profile_b_id UUID REFERENCES profiles(id),
  match_id UUID REFERENCES matches(id),  -- Source match
  baby_id UUID REFERENCES babies(id),
  status TEXT DEFAULT 'active',  -- active, blocked, archived
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Function

#### `get_match_commonalities(face_id_1, face_id_2)`
**Returns**: `JSONB`

**Logic**:
```sql
SELECT jsonb_agg(commonality)
FROM (
  -- Age similarity (within 2 years)
  SELECT
    'age' as type,
    'similar age' as message,
    face1.age || ' and ' || face2.age || ' years old' as detail
  WHERE ABS(face1.age - face2.age) <= 2

  UNION ALL

  -- Facial geometry (similar proportions)
  SELECT
    'geometry' as type,
    'similar facial features' as message,
    'face proportions match closely' as detail
  WHERE similar_geometry_check(face1, face2)

  UNION ALL

  -- Symmetry (within 0.1)
  SELECT
    'symmetry' as type,
    'similar facial symmetry' as message,
    'symmetry scores: ' || face1.symmetry || ' and ' || face2.symmetry as detail
  WHERE ABS(face1.symmetry_score - face2.symmetry_score) <= 0.1

  UNION ALL

  -- Skin tone (Delta E < 10 in CIELAB)
  SELECT
    'skin_tone' as type,
    'similar skin tone' as message,
    'skin tone difference: ' || delta_e || ' (very close)' as detail
  WHERE calculate_delta_e(face1.skin_tone_lab, face2.skin_tone_lab) < 10

  UNION ALL

  -- Expression (same dominant emotion)
  SELECT
    'expression' as type,
    'same expression' as message,
    'both have ' || face1.expression || ' expression' as detail
  WHERE face1.expression = face2.expression
) commonalities;
```

---

## File Structure

### New Files
```
src/features/matching/components/
├── commonalities-badge.tsx          # NEW: Badge component
└── commonalities-detail.tsx         # NEW: Detailed view component
```

### Modified Files
```
src/app/api/
└── connections/route.ts             # Add match_id + commonalities

src/features/chat/
├── types/index.ts                   # Add commonalities to MutualConnection
└── components/
    ├── chat-header.tsx              # Display commonalities badges
    └── connection-item.tsx          # Show commonality count
```

### Existing Files (Reference Only)
```
src/features/matching/
├── api/
│   └── get-match-details.ts         # Already fetches commonalities
├── utils/
│   └── generate-match-message.ts    # Utility functions
└── components/
    └── match-dialog/
        └── baby-generator.tsx       # Already uses commonalities
```

---

## Success Criteria

### User Experience
- [ ] Users see what they have in common when opening chat
- [ ] Commonalities displayed prominently in chat header
- [ ] Connection list shows commonality indicator
- [ ] Smooth, polished UI with animations
- [ ] Mobile responsive

### Technical
- [ ] Connections API returns commonalities efficiently
- [ ] No performance degradation (< 500ms API response)
- [ ] TypeScript types are correct
- [ ] All components follow existing design system
- [ ] Edge cases handled gracefully

### Business Impact
- [ ] Users have conversation starters based on "hard facts"
- [ ] Increased engagement (hypothesis: better first messages)
- [ ] Reduced awkward silences in new chats

---

## Future Enhancements

### Phase 2 (Optional)
1. **AI-Generated Ice Breakers**: Use commonalities to generate personalized conversation starters
   - Example: "You both have a warm smile! Ask about what makes them happiest."

2. **Commonality Trends**: Show which commonalities are most rare/special
   - Example: "Only 5% of matches share your eye color!"

3. **Expanded Detection**: Add more commonality types
   - Smile width
   - Eyebrow shape
   - Face shape category (oval, round, square)
   - Hair color (if detectable)

4. **Commonality Reactions**: Let users react to specific commonalities
   - "I noticed we have similar age too! 👍"

5. **Match Insights Page**: Dedicated page showing all match analysis
   - Detailed facial comparison visualization
   - Similarity breakdown by feature
   - Compatibility score explanation

---

## Performance Considerations

### Current Performance
- **Facial analysis**: ~3-5 seconds per image (Replicate)
- **Commonalities detection**: ~10-50ms (database function)
- **Already optimized**: Indexed queries, single RPC call

### Optimization Needed
**Connections API**: Currently fetches commonalities one by one
```typescript
// BEFORE (N+1 query problem)
const connections = await connectionsData.map(async (conn) => {
  const { data: commonalities } = await supabase.rpc("get_match_commonalities", {...});
  // ...
});
```

**Solution**: Batch fetch or denormalize
```typescript
// OPTION 1: Batch RPC call
const matchIds = connectionsData.map(c => c.match_id);
const allCommonalities = await batchGetCommonalities(matchIds);

// OPTION 2: Denormalize (store in mutual_connections)
ALTER TABLE mutual_connections ADD COLUMN commonalities JSONB;
// Update on connection creation
```

**Recommendation**: Start with Option 1, migrate to Option 2 if needed.

---

## Testing Plan

### Unit Tests
```typescript
// commonalities-badge.test.tsx
describe("CommonalitiesBadge", () => {
  it("renders compact variant with icons only", () => {});
  it("renders full variant with labels", () => {});
  it("handles empty commonalities array", () => {});
  it("shows tooltips on hover", () => {});
});

// generate-match-message.test.ts (already exists)
describe("generateMatchMessage", () => {
  it("generates correct message for single commonality", () => {});
  it("generates correct message for multiple commonalities", () => {});
  it("handles empty array", () => {});
});
```

### Integration Tests
1. **API Test**: Verify connections endpoint returns commonalities
2. **Component Test**: Verify chat header displays badges
3. **E2E Test**: Full flow from match to chat with commonalities

### Manual Testing Scenarios
1. **Happy Path**: Match with 3+ commonalities → Open chat → See badges
2. **No Commonalities**: Match with no detected commonalities → See generic message
3. **Partial Data**: Old match with missing facial attributes → Graceful degradation
4. **Performance**: 20+ connections → API responds in < 1s

---

## Documentation Updates

After implementation, update:

1. **`.agent/system/database_schema.md`**
   - Document mutual_connections.match_id relationship
   - Document commonalities JSON structure

2. **`.agent/system/project_architecture.md`**
   - Add commonalities display to user flow
   - Document new components

3. **`.agent/README.md`**
   - Add link to this task document

4. **`README.md`** (root)
   - Add to "Recent Updates" section

---

## Timeline Estimate

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Backend updates (API + types) | 30 min |
| Phase 2 | UI components (badge + detail) | 1-2 hours |
| Phase 3 | Chat integration (header + list) | 1 hour |
| Phase 4 | Polish, testing, edge cases | 30 min |
| **Total** | | **3-4 hours** |

---

## Dependencies

### External
- None (all infrastructure exists)

### Internal
- Existing `generate-match-message` utility
- Existing Badge, Card, Tooltip components
- Existing `useMatchDetails` hook
- Existing Supabase RPC function

### Blocked By
- None

### Blocking
- None (can be implemented independently)

---

## Risk Assessment

### Low Risk ✅
- Backend infrastructure already proven in production
- Commonalities function already tested
- UI components follow existing patterns
- No database migrations required

### Medium Risk ⚠️
- Performance of connections API (N+1 queries)
  - **Mitigation**: Monitor API response times, implement batching if needed
- Design consistency with existing UI
  - **Mitigation**: Follow design system strictly

### High Risk ❌
- None identified

---

## Rollout Plan

### Phase 1: Soft Launch (Internal Testing)
1. Deploy to staging
2. Test with real matches
3. Verify performance metrics

### Phase 2: Beta (Select Users)
1. Enable for 10% of users
2. Monitor engagement metrics
3. Collect feedback

### Phase 3: Full Launch
1. Enable for all users
2. Monitor support tickets
3. Iterate based on feedback

### Rollback Plan
- Feature flag: `ENABLE_MATCH_COMMONALITIES`
- Can disable without code changes
- No data loss (non-destructive)

---

## Monitoring & Metrics

### Technical Metrics
- Connections API response time (target: < 500ms)
- Commonalities fetch success rate (target: > 99%)
- Error rate (target: < 0.1%)

### Product Metrics
- % of chats with commonalities displayed
- Time to first message (hypothesis: faster with commonalities)
- Message quality (longer first messages?)
- User engagement (messages per conversation)

### Success Metrics (30 days)
- 80%+ of new connections see commonalities
- 20%+ improvement in first message quality
- No performance degradation

---

## Notes

- Implementation is straightforward thanks to existing infrastructure
- Most work is frontend UI/UX
- Backend changes are minimal and safe
- Feature can be rolled out incrementally
- High user value, low technical risk

---

## Related Documents

- `.agent/system/project_architecture.md` - Overall system design
- `.agent/system/database_schema.md` - Database structure
- `.agent/sop/animations.md` - Animation guidelines
- Migration 027: `get_match_commonalities` function
- Migration 018: Advanced face attributes schema

---

## Questions & Decisions

### Q: Should we show commonalities in the match card (live feed)?
**Decision**: Not in Phase 1. Focus on chat UI first. Can add later as enhancement.

### Q: What if no commonalities detected?
**Decision**: Show generic "It's a match!" message. Don't force commonalities.

### Q: Performance of N+1 queries in connections API?
**Decision**: Implement first, optimize if needed. Monitor response times.

### Q: Should we cache commonalities?
**Decision**: React Query handles caching. No additional caching needed initially.

### Q: Mobile vs desktop design?
**Decision**: Responsive design. Compact badges on mobile, full on desktop.

---

## Status: Ready for Implementation

All research complete, infrastructure verified, plan approved.
