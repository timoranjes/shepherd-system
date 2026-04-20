# sheep-shepherd-system

## Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 + `@tailwindcss/postcss` (NOT tailwind.config.js)
- shadcn/ui (style: new-york), Radix UI primitives
- pnpm (or npm if pnpm unavailable)
- Supabase (Auth, Database, Realtime, Storage)

## Commands
```bash
pnpm dev      # dev server
pnpm build    # production build
pnpm start    # start production server
pnpm lint     # ESLint
```

## Paths
- `@/*` → `./*` (root)
- `@/components` → `components/`
- `@/components/ui` → `components/ui/`
- `@/lib` → `lib/`
- `@/hooks` → `hooks/`

## Styling / Theme
- CSS variables in `app/globals.css` (oklch color space)
- Dark mode via `next-themes`; `.dark` class toggles dark variables
- Tailwind v4 uses `@theme inline` block, NOT `tailwind.config`

## UI Components
- shadcn/ui components at `components/ui/`
- Managed via `components.json` schema
- `lib/utils.ts` exports `cn()` (clsx + tailwind-merge)

## Build Config
- `next.config.mjs`: `ignoreBuildErrors: true`, `images.unoptimized: true`

## Architecture
- App Router pages under `app/`
- Dynamic routes: `app/targets/[id]/page.tsx`
- `"use client"` components for interactivity
- Bilingual (zh-Hant / zh-Hans) via client-side toggle
- Auth-protected routes via `middleware.ts`; public routes are `/` and `/login`

## Supabase Setup

### Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database Setup (Supabase SQL Editor)
Run files in order:
1. `supabase/schema.sql` - Creates all tables, triggers, functions
2. `supabase/rls.sql` - Enables RLS and creates policies
3. `supabase/seed.sql` - Inserts sample data (optional)

### Key Tables
- `profiles` - Extends auth.users with role, hierarchy info
- `hierarchies` - Geographic/group structure (大区 → 小区 → 小排)
- `members` - Gospel friends & new believers
- `pastoring_logs` - Care visit records
- `materials` - Gospel resources
- `prayers` - Prayer requests
- `amen_actions` - Tracks "阿們" clicks
- `activities` - Dashboard timeline

### Hierarchy Access Control
- Users have a `hierarchy_id` and `hierarchy_level`
- RLS policies filter data based on user's hierarchy scope
- `get_user_hierarchy_ids(profile_id)` RPC returns all child hierarchy IDs
- Admin at 小排 sees only their small group's data

### Realtime
- Subscriptions on `activities`, `prayers`, `amen_actions` tables
- Hooks: `useActivities`, `usePrayers`, `useAmenActions`

### OAuth Providers
- Enable in Supabase: Email/Password, Google, GitHub
- Auth callback at `/auth/callback`

### Storage
- `materials` bucket for file uploads
- RLS restricts upload to authenticated users

## Available Hooks
- `useUser()` - Current user & profile
- `useMembers(hierarchyIds?)` - Fetch members with RLS filtering
- `useMember(id)` - Single member detail
- `usePastoringLogs(memberId)` - Pastoring logs for a member
- `usePrayers(hierarchyIds?, category?)` - Prayer requests
- `useAmenActions(userId)` - User's amen votes + toggle
- `useMaterials(category?)` - Materials with optional filter
- `useActivities(hierarchyIds?, limit?)` - Dashboard activities
- `useHierarchies()` - All hierarchies
- `useUserHierarchyIds(profileId)` - IDs for user's scope
