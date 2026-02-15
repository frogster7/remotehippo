# Build log – Niche Tech Job Board

Reference for what was implemented at each major step. Use this when debugging or continuing work so you don’t get confused about existing behavior.

---

## Task 1: Next.js + Tailwind + TS scaffold

**Commit:** `Task 1: Next.js + Tailwind + TS scaffold with shadcn/ui`

**What was done:**
- Next.js 15 (App Router), TypeScript, Tailwind CSS.
- shadcn/ui (New York style, neutral base, CSS variables). Components added later as needed.
- ESLint (Next + TypeScript).
- App shell: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- Config: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`.
- `lib/utils.ts` (shadcn `cn()`), `components.json` (shadcn config).

**Key files:**
- `app/layout.tsx` – root layout, metadata.
- `app/page.tsx` – home page.
- `app/globals.css` – Tailwind + shadcn CSS variables.
- `lib/utils.ts` – `cn()` for class names.
- `components.json` – shadcn aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`.

**Notes:** Package name is `anichejobboard` (lowercase) in `package.json` to satisfy npm. Next.js is on a patched version (15.1.9) for security.

---

## Task 2: Supabase setup (includes DB + RLS = Task 4)

**Commit:** `Task 2: Supabase setup - client, server utils, env example, DB migration + RLS`

**What was done:**
- Installed `@supabase/supabase-js` and `@supabase/ssr`.
- Browser client: `lib/supabase/client.ts` – `createClient()` for Client Components.
- Server client: `lib/supabase/server.ts` – `createClient()` (async) for Server Components, Route Handlers, Server Actions; uses `cookies()` from `next/headers`.
- `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Single SQL migration: tables, enums, triggers, RLS (Task 4 is included here).
- `supabase/README.md` – how to create project, set env, run migration, add auth redirect URL.

**Key files:**
- `lib/supabase/client.ts` – use in `"use client"` components.
- `lib/supabase/server.ts` – use in server components / route handlers / server actions (always `await createClient()`).
- `supabase/migrations/001_initial_schema.sql` – full schema + RLS; run once in Supabase SQL Editor.
- `.env.local` – user’s real credentials (not committed; see `.gitignore`).

**Database (from migration):**
- **Enums:** `profile_role` (employer, job_seeker), `work_type` (remote, hybrid), `job_type` (full-time, contract).
- **Tables:** `profiles` (id → auth.users, role, full_name, company_*, created_at), `jobs` (employer_id → profiles, title, slug, description, tech_stack, role, work_type, job_type, salary_*, location, eu_timezone_friendly, is_active, created_at, updated_at), `job_favorites` (user_id, job_id, unique pair).
- **Triggers:** `handle_new_user` – on `auth.users` INSERT, creates row in `profiles` using `raw_user_meta_data` (full_name, role). `jobs_updated_at` – sets `updated_at` on jobs UPDATE.
- **RLS:** Profiles viewable by all, update/delete own. Jobs: public sees active only; employers see and manage own. Favorites: users see and manage own.

**Notes:** User created `.env.local` with their Supabase URL and anon key. Redirect URL for auth: `http://localhost:3000/auth/callback` (and production URL) must be in Supabase Auth → URL Configuration.

---

## Task 3: Auth flows

**Commit:** `Task 3: Auth flows - login, register, profile, callback, header`

**What was done:**
- Auth callback route for code exchange (e.g. email confirmation, OAuth): `app/auth/callback/route.ts`. Reads `?code` and optional `?next`, exchanges code for session, redirects to `next` or `/`.
- Login: `app/login/page.tsx` (server), `app/login/login-form.tsx` (client). Email + password via Supabase; supports `?next=` for redirect after login (e.g. `/login?next=/profile`).
- Register: `app/register/page.tsx`, `app/register/register-form.tsx`. Email, password, full name, role (job_seeker | employer). Sends `options.data: { full_name, role }` to Supabase so `handle_new_user` trigger can create `profiles` row. Shows “Check your email” after submit (when email confirmation is enabled).
- Profile: `app/profile/page.tsx` (server – fetches user and profile, redirects to `/login?next=/profile` if not logged in), `app/profile/profile-form.tsx` (client – edit full_name, role, company_name, company_website; save to `profiles`; sign out button).
- Header: `app/_components/header.tsx` – server component that gets user via `createClient()` from server; shows “Log in” / “Sign up” or “Profile” link. Included in `app/layout.tsx`.
- shadcn components added: `button`, `input`, `card`, `label` (used in auth forms).
- `supabase/README.md` updated with step for adding auth redirect URL.

**Key files:**
- `app/auth/callback/route.ts` – GET handler, no UI.
- `app/login/page.tsx` + `app/login/login-form.tsx` – login page and form (client form calls `createClient()` from `@/lib/supabase/client`).
- `app/register/page.tsx` + `app/register/register-form.tsx` – signup with role and full_name in metadata.
- `app/profile/page.tsx` + `app/profile/profile-form.tsx` – profile load (server) and edit/sign out (client).
- `app/_components/header.tsx` – auth state in layout.

**Notes:** Email confirmation can be turned off in Supabase (Authentication → Providers → Email) to avoid rate limits and “Email not confirmed” during dev. Profile INSERT is done only by DB trigger on signup; app only UPDATEs profiles.

---

## Fix: Hydration mismatch (browser extension)

**What was done:**
- In `app/layout.tsx`, added `suppressHydrationWarning` to `<body>`.
- Cause: browser extensions (e.g. password managers) add attributes to `<body>` after server render, so server HTML and client DOM didn’t match. This is not an app bug.

**Key file:** `app/layout.tsx` – `<body className="antialiased" suppressHydrationWarning>`.

---

## Not done yet (from PROJECT_BRIEF §13)

- **Task 5:** Public job pages – `/jobs` (list + filters), `/jobs/[slug]` (detail).
- **Task 6:** Employer dashboard – CRUD jobs, `/employer/dashboard`, `/employer/jobs/new`, `/employer/jobs/[id]/edit`.
- **Task 7:** Favorites – job seekers save jobs, `/saved-jobs`.
- **Task 8:** SEO – meta tags, sitemap, robots, etc.
- **Task 9:** Final polish.

---

## Quick reference

| Need to…                    | Look at… |
|-----------------------------|----------|
| Change Supabase env         | `.env.local`, `.env.example` |
| Change DB or RLS            | `supabase/migrations/001_initial_schema.sql` (then re-run or add new migration) |
| Fix auth (login/register)   | `app/login/*`, `app/register/*`, `app/auth/callback/route.ts` |
| Fix profile                 | `app/profile/*`, RLS on `profiles` |
| Fix header / auth state     | `app/_components/header.tsx`, `app/layout.tsx` |
| Add UI components           | `npx shadcn@latest add <component>`, `components/ui/` |
| Supabase client in component| Client: `lib/supabase/client.ts`. Server: `lib/supabase/server.ts` (await). |
