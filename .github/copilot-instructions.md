# Copilot Instructions for Fuzed (AI Face Matching)

## Project Overview
Next.js 16 app using Supabase (PostgreSQL + Auth + Realtime), Replicate (face AI), and FAL.AI (baby generation). Uses TanStack Query for server state, Zustand for client state, and Tailwind CSS 4 + shadcn/ui for styling.

## Essential Context
**Before implementing features, read `.agent/README.md`** for documentation index—covers architecture, database schema, SOPs, and completed tasks.

## Architecture Patterns

### Feature-Based Organization
Features live in `src/features/{feature}/` with subdirectories:
- `api/` - One file per endpoint: `[action]-[resource].ts` (e.g., `get-user-match.ts`, `generate-baby.ts`)
- `components/` - Feature-specific UI
- `hooks/` - Custom React hooks
- `store/` - Zustand stores
- `types/` - Feature types

### API File Pattern
```typescript
// src/features/matching/api/get-user-match.ts
export const getUserMatchApi = async (input: Input, signal?: AbortSignal) => {...};
export const getUserMatchQueryOptions = (input: Input) => queryOptions({...});
export const useUserMatch = (options: Options) => useQuery({...});
```
Always include `signal?: AbortSignal` parameter for cancellation support.

### Protected Routes
Use Next.js route groups: `src/app/(authenticated)/` contains protected pages. Auth check happens in `(authenticated)/layout.tsx` using server-side Supabase client.

### Supabase Clients
- Server components/API routes: `import { createClient } from "@/lib/supabase/server"`
- Client components: `import { createClient } from "@/lib/supabase/client"`
- Admin operations: `import { createAdminClient } from "@/lib/supabase/admin"`

## Database Conventions

### Migrations
Create in `supabase/migrations/` with format: `YYYYMMDDHHmmss_short_description.sql`
- Always enable RLS on new tables
- Separate policies per operation (select/insert/update/delete) and role (anon/authenticated)
- Use `auth.uid()` not `current_user`

### Database Functions
```sql
create or replace function public.my_function()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Use fully qualified names: public.table_name
end;
$$;
```

## Environment Variables
Type-safe via `@t3-oss/env-nextjs` in `src/config/env.ts`. Import as: `import { env } from "@/config/env"`. Never use `process.env` directly.

## Developer Workflow
```bash
bun install          # Install deps
bun run dev          # Dev server at localhost:3000
bun run lint         # Biome check --write
bun run test         # Vitest
bun run gen:type     # Regenerate Supabase types after schema changes
```

## Key Integrations
- **Real-time presence**: Global Zustand store (`src/features/presence/store/`) with single Supabase Realtime subscription
- **Face analysis**: Replicate API via `/api/faces/` endpoints
- **Baby generation**: FAL.AI via `/api/baby/` endpoints
- **Notifications**: Real-time via Supabase + `src/features/notifications/`

## Code Style
- Biome for linting/formatting (tabs, double quotes)
- Framer Motion for animations (see `.agent/sop/animations.md`)
- Use `@/` path alias for imports from `src/`
