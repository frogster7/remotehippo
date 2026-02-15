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

## Task 5: Public job pages

**What was done:**
- **Types:** `lib/types.ts` – `Job`, `JobFilters`, `WorkType`, `JobType`, and constants `WORK_TYPES`, `JOB_TYPES`.
- **Data layer:** `lib/jobs.ts` – `getJobs(filters)` for list with filters, `getJobBySlug(slug)` for detail (with employer profile embed), `getFilterOptions()` for role/tech dropdowns.
- **List page:** `app/jobs/page.tsx` – SSR, reads `searchParams` (q, role, work_type, job_type, tech, salary_min, salary_max), renders job cards with link to `/jobs/[slug]`. Empty state when no results.
- **Filters UI:** `app/jobs/jobs-filter.tsx` – client component using shadcn `Select`, `Input`, `Button`; syncs filters to URL via `useSearchParams` / `router.push`; Clear filters when any filter is set.
- **Detail page:** `app/jobs/[slug]/page.tsx` – SSR, `generateMetadata` for title/description, employer block (logo, company name, website), tech stack badges, salary, location, description, apply CTA.
- **Navigation:** Header has “Jobs” link; home page has “Browse jobs” CTA.
- **shadcn:** Added `badge`, `select` components.

**Key files:**
- `lib/types.ts` – job and filter types.
- `lib/jobs.ts` – server-side job queries (use `createClient()` from `@/lib/supabase/server`).
- `app/jobs/page.tsx` – jobs list (server).
- `app/jobs/jobs-filter.tsx` – filters (client, URL-driven).
- `app/jobs/[slug]/page.tsx` – job detail (server).

**Notes:** List and detail are server-rendered for SEO. Filter state is in the URL so filtered views are shareable/indexable. Apply button uses a placeholder `mailto:`; real apply flow (e.g. employer email or link) can be added in employer dashboard (Task 6).

---

## Fix: Header not updating after login / sign out

**What was done:**
- Login and sign out now use a **full page redirect** (`window.location.href`) instead of `router.refresh()` + `router.push()`. The header is a server component that reads the session from cookies; client-side navigation did not always re-run the layout with the new cookies, so the header kept showing “Log in” / “Sign up” or “Profile” until a manual refresh.
- **Login:** `app/login/login-form.tsx` – after successful `signInWithPassword`, redirect with `window.location.href = redirectTo`.
- **Sign out:** `app/profile/profile-form.tsx` – after `signOut()`, redirect with `window.location.href = "/"`.

**Key files:** `app/login/login-form.tsx`, `app/profile/profile-form.tsx`.

**Notes:** PROJECT_BRIEF.md is the product/scope spec and is not updated with implementation details; BUILD_LOG.md (this file) is the implementation log.

---

## Task 6: Employer dashboard (CRUD jobs)

**What was done:**
- **Data layer:** `lib/jobs.ts` – `slugifyTitle()`, `generateJobSlug(title)` for new jobs; `getEmployerJobs(employerId)` for dashboard list; `getJobByIdForEdit(jobId)` for edit page (RLS ensures only owner can read).
- **Server actions:** `app/employer/actions.ts` – `createJob(form)` (generates slug, inserts, then redirects to dashboard), `updateJob(jobId, form)`, `deleteJob(jobId)` (redirects to dashboard on success). All actions call `ensureEmployer()` (redirect to login or profile if not employer).
- **Dashboard:** `app/employer/dashboard/page.tsx` – server page; redirects to login or profile if not employer; lists own jobs with View (public slug), Edit, and status (Active/Draft); “New job” CTA.
- **New job:** `app/employer/jobs/new/page.tsx` – employer-only; `JobForm` with create action.
- **Edit job:** `app/employer/jobs/[id]/edit/page.tsx` – employer-only; loads job by id, 404 if not found or not owner; `JobForm` with update/delete actions.
- **Job form:** `app/employer/job-form.tsx` – client component; fields: title, role, description, work_type, job_type, tech_stack (comma/semicolon), salary min/max, location, eu_timezone_friendly, is_active; Create / Save / Cancel / Delete (edit only). Uses shadcn `Input`, `Label`, `Select`, `Checkbox`, `Card`, `Button`.
- **Header:** Dashboard link shown only when user is employer (profile.role === 'employer'); header fetches profile when user exists.
- **shadcn:** Added `checkbox` component.

**Key files:**
- `lib/jobs.ts` – employer helpers and slug generation.
- `app/employer/actions.ts` – create/update/delete job (server actions).
- `app/employer/dashboard/page.tsx` – employer dashboard list.
- `app/employer/jobs/new/page.tsx` – new job page.
- `app/employer/jobs/[id]/edit/page.tsx` – edit job page.
- `app/employer/job-form.tsx` – shared form for new/edit.
- `app/_components/header.tsx` – Dashboard link for employers.

**Notes:** Edit route uses job `id` (uuid), not slug, so URLs are stable and ownership is enforced by RLS. Create uses auto-generated unique slug. Non-employers hitting employer routes are redirected to profile.

---

## Fix: Employer dashboard – client/server boundary (Task 6 follow-up)

**What was done:**
- **JobFormData** moved from `app/employer/actions.ts` to `lib/types.ts` so the client `JobForm` never imports from the `"use server"` actions file (avoids webpack bundling server-only code in the client and “Cannot read properties of undefined (reading 'call')”).
- **JobForm** action props (`createAction`, `updateAction`, `deleteAction`) made optional; new job page passes only `createAction={createJob}`; edit page passes only `updateAction` and `deleteAction`. Removed inline lambdas (e.g. `async () => ({ error: "..." })`) so no non–server-action functions are passed to the Client Component (fixes “Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'”).

**Key files:** `lib/types.ts` (JobFormData), `app/employer/job-form.tsx` (optional props, guards), `app/employer/jobs/new/page.tsx`, `app/employer/jobs/[id]/edit/page.tsx` (only pass the actions each page needs).

---

## Not done yet (from PROJECT_BRIEF §13)

- **Task 8:** SEO – meta tags, sitemap, robots, etc.
- **Task 9:** Final polish.

---

## Task 7: Favorites (saved jobs)

**What was done:**
- **Data layer:** `lib/jobs.ts` – `isJobFavorited(jobId, userId)` checks if a job is favorited; `getFavoritedJobs(userId)` fetches all favorited jobs with employer profile; `getFavoritedJobIds(userId)` returns Set of job IDs for fast lookup in list views.
- **Server actions:** `app/favorites/actions.ts` – `toggleFavorite(jobId)` adds/removes favorite (checks auth, returns new state); `ensureLoggedIn(currentPath)` helper redirects to login if not authenticated.
- **UI component:** `app/favorites/favorite-button.tsx` – client component with heart icon; three variants: `default` (button with text), `ghost`, and `icon` (small icon-only for list views); redirects to login if not logged in; optimistic UI with loading state.
- **Job detail:** `app/jobs/[slug]/page.tsx` – added FavoriteButton in header next to title; checks if job is favorited server-side and passes to button.
- **Jobs list:** `app/jobs/page.tsx` – fetches favorited job IDs for current user; passes to JobCard component.
- **Job card:** `app/jobs/job-card.tsx` – new client component for job list items; includes small heart icon favorite button in the top-right corner; clickable card area (Link) with favorite button overlay.
- **Saved jobs page:** `app/saved-jobs\page.tsx` – server page; redirects to login if not authenticated; lists all favorited jobs with employer info, tech stack, badges; empty state with link to /jobs; each job card has favorite button (always true initially, toggles to remove).
- **Header:** `app/_components/header.tsx` – "Saved Jobs" link shown only when user is logged in (between "Jobs" and "Dashboard"/"Profile").

**Key files:**
- `lib/jobs.ts` – favorite helpers.
- `app/favorites/actions.ts` – server actions for toggle.
- `app/favorites/favorite-button.tsx` – reusable favorite button (client).
- `app/jobs/[slug]/page.tsx` – detail with favorite.
- `app/jobs/page.tsx` – list with favorites.
- `app/jobs/job-card.tsx` – job card component.
- `app/saved-jobs/page.tsx` – saved jobs list.
- `app/_components/header.tsx` – Saved Jobs link.

**Notes:** Favorites are managed via `job_favorites` table with RLS (users can only manage own rows). FavoriteButton uses optimistic UI (updates state immediately, shows loading). Non-logged-in users are redirected to login with `?next=` parameter. Icon uses lucide-react `Heart` component (filled when favorited). All changes revalidate `/saved-jobs` and `/jobs` paths for fresh data.

---

## Quick reference

| Need to…                    | Look at… |
|-----------------------------|----------|
| Change Supabase env         | `.env.local`, `.env.example` |
| Change DB or RLS            | `supabase/migrations/001_initial_schema.sql` (then re-run or add new migration) |
| Fix auth (login/register)   | `app/login/*`, `app/register/*`, `app/auth/callback/route.ts` |
| Fix profile                 | `app/profile/*`, RLS on `profiles` |
| Fix header / auth state     | `app/_components/header.tsx`, `app/layout.tsx` |
| Jobs list / filters         | `app/jobs/page.tsx`, `app/jobs/jobs-filter.tsx`, `app/jobs/job-card.tsx`, `lib/jobs.ts` |
| Job detail                  | `app/jobs/[slug]/page.tsx`, `lib/jobs.ts` |
| Employer dashboard / CRUD   | `app/employer/dashboard/*`, `app/employer/jobs/*`, `app/employer/actions.ts`, `app/employer/job-form.tsx`, `lib/jobs.ts` |
| Favorites / saved jobs      | `app/favorites/*`, `app/saved-jobs/*`, `app/jobs/job-card.tsx`, `lib/jobs.ts` |
| Add UI components           | `npx shadcn@latest add <component>`, `components/ui/` |
| Supabase client in component| Client: `lib/supabase/client.ts`. Server: `lib/supabase/server.ts` (await). |
