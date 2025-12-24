# AI Matching (Fuzed) - Copilot Instructions

## Essential Context

**Before implementing anything, read `.agent/README.md`** for full system documentation, completed tasks, and SOPs.

This is a Next.js 16 App Router application for AI-powered face matching with Supabase backend.

## Architecture Overview

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + Shadcn/Radix UI
- **State**: TanStack Query (server) + Zustand (client)
- **Backend**: Next.js API routes + Supabase (PostgreSQL with pgvector)
- **AI Services**: Replicate (face analysis), FAL.AI (baby generation)
- **Auth**: Supabase Auth with Magic Link via `@supabase/ssr`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (authenticated)/    # Protected routes (layout guards auth)
│   ├── (landing-page)/     # Public routes
│   └── api/                # API route handlers
├── features/               # Feature modules (matching, chat, auth, etc.)
│   └── [feature]/
│       ├── api/            # One file per endpoint
│       ├── components/     # Feature-specific UI
│       ├── hooks/          # Feature hooks
│       └── types/          # Feature types
├── components/             # Shared UI components
├── lib/                    # Utilities, Supabase clients, API client
└── config/env.ts           # Type-safe env vars (@t3-oss/env-nextjs)
```

## Critical Conventions

### API Files (Feature APIs)

**One concern per file** with naming pattern `[action]-[resource].ts`:

```typescript
// src/features/matching/api/get-match-details.ts
import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";

export const getMatchDetailsApi = async (matchId: string) => {
  return api.get<MatchDetails>(`/matches/${matchId}`);
};

export const getMatchDetailsQueryOptions = (matchId: string) => {
  return queryOptions({
    queryKey: ["matches", matchId, "details"],  // Hierarchical keys
    queryFn: () => getMatchDetailsApi(matchId),
  });
};

export const useMatchDetails = ({ matchId, queryConfig }) => {
  return useQuery({ ...getMatchDetailsQueryOptions(matchId), ...queryConfig });
};
```

### Environment Variables

Always use `env` from `@/config/env` - never `process.env` directly:

```typescript
import { env } from "@/config/env";
const url = env.NEXT_PUBLIC_SUPABASE_URL;  // Type-safe, validated
```

### Database Migrations

Create in `supabase/migrations/` with format `YYYYMMDDHHmmss_description.sql`:
- Always enable RLS on new tables
- Use separate policies per operation (select/insert/update/delete)
- Set `search_path = ''` in functions, use fully qualified names

### Supabase Realtime

- Use `broadcast` for all events (not `postgres_changes`)
- Topic naming: `scope:entity:id` (e.g., `room:123:messages`)
- Event naming: `entity_action` in snake_case (e.g., `message_created`)

## Commands

```bash
bun run dev          # Development server (port 3000)
bun run build        # Production build
bun run lint         # Biome check --write
bun run test         # Vitest
bun run gen:type     # Regenerate Supabase types
```

## Key Patterns

- **Auth guard**: `(authenticated)/layout.tsx` uses server-side Supabase to protect routes
- **API client**: `src/lib/api-client.ts` wraps fetch with typed responses
- **Formatting**: Biome with tabs, double quotes - run `bun run lint` before committing
- **Components**: Prefer Shadcn/Radix primitives from `src/components/ui/`

## Documentation

- `.agent/sop/` - Standard operating procedures (animations, API organization, env vars)
- `.agent/system/` - Architecture and database schema docs
- `.cursor/rules/` - Database function, migration, RLS, and Edge Function guidelines
