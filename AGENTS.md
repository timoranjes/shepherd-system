# sheep-shepherd-system

## Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 + `@tailwindcss/postcss` (NOT tailwind.config.js)
- shadcn/ui (style: new-york), Radix UI primitives
- pnpm (or npm if pnpm unavailable)
- Supabase (Auth, Database, Realtime, Storage)

## Commands
```bash
pnpm dev        # dev server
pnpm build      # production build (also catches type errors; no separate typecheck)
pnpm start      # start production server
pnpm lint       # ESLint
pnpm test       # Vitest watch mode
pnpm test:run   # Vitest single run
```

## Paths
- `@/*` → `./*` (root)

## Styling / Theme
- CSS variables in `app/globals.css` (oklch color space)
- Dark mode via `next-themes`; `.dark` class toggles dark variables
- Tailwind v4 uses `@theme inline` block, NOT `tailwind.config`

## UI Components
- shadcn/ui at `components/ui/`, managed via `components.json`
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge)

## Architecture
- App Router pages under `app/`
- Dynamic routes: `app/targets/[id]/page.tsx`
- `"use client"` components for interactivity
- Bilingual (zh-Hant / zh-Hans) via client-side toggle
- Auth-protected routes via `middleware.ts`; public routes: `/` and `/login`

## Supabase Setup

### Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database Setup (Supabase SQL Editor, in order)
1. `supabase/schema.sql` — tables, triggers, functions
2. `supabase/rls.sql` — enables RLS and creates policies
3. `supabase/seed.sql` — sample data (optional)

### Key Tables
- `profiles` — extends auth.users with role, hierarchy info
- `hierarchies` — geographic/group structure (大区 → 小区 → 小排)
- `members` — gospel friends & new believers
- `pastoring_logs` — care visit records
- `materials` — gospel resources
- `prayers` — prayer requests
- `amen_actions` — tracks "阿們" clicks (amen_count on prayers is auto-managed by DB triggers)
- `activities` — dashboard timeline (auto-created by DB trigger when pastoring_log is inserted)

### Access Control
- Users have `hierarchy_id` and `hierarchy_level`
- RLS policies filter data by user's hierarchy scope
- `get_user_hierarchy_ids(profile_id)` RPC returns all child hierarchy IDs

### Realtime
Subscriptions on `activities`, `prayers`, `amen_actions` tables via hooks.

### Storage
- `materials` bucket for file uploads; RLS restricts upload to authenticated users

## Available Hooks
- `useUser()` — current user & profile (has 15s auth fallback redirect to /login)
- `useMembers(hierarchyIds?)` — members with RLS filtering
- `useMember(id)` — single member detail
- `usePastoringLogs(memberId)` — pastoring logs for a member
- `usePrayers(hierarchyIds?, category?)` — prayer requests
- `useAmenActions(userId)` — user's amen votes + `toggleAmen(prayerId)`
- `useMaterials(category?)` — materials
- `useActivities(hierarchyIds?, limit?)` — dashboard activities
- `useHierarchies()` — all hierarchies
