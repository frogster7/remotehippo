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
- **Tables:** `profiles` (id → auth.users, role, full*name, company*_, created*at), `jobs` (employer_id → profiles, title, slug, description, tech_stack, role, work_type, job_type, salary*_, location, eu_timezone_friendly, is_active, created_at, updated_at), `job_favorites` (user_id, job_id, unique pair).
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

**Follow-up (extensions injecting into divs):** Some extensions (e.g. Bitdefender) inject `bis_skin_checked="1"` into container divs. Added `suppressHydrationWarning` to the header inner div (`header.tsx`), home page container (`page.tsx`), and a wrapper div in `layout.tsx` around `<Header />` and `{children}` so hydration warnings from injected attributes are suppressed.

**Follow-up (homepage sections):** Extension continued to inject into many nested divs on the homepage (HomeHero, RecentJobs, CompaniesWorthKnowing). Because `suppressHydrationWarning` only applies one level deep, added a reusable `HydrationSafeDiv` component (`components/hydration-safe-div.tsx`) – a `forwardRef` div that sets `suppressHydrationWarning`. Replaced all structural divs in `home-hero.tsx`, `recent-jobs.tsx`, and `companies-worth-knowing.tsx` with `HydrationSafeDiv`; added `suppressHydrationWarning` to `<main>` in `app/page.tsx`. This eliminates hydration mismatches from extension-injected attributes on the home page.

---

## Fix: Next.js Image – Supabase storage hostname

**What was done:**

- `next/image` requires remote hostnames to be allowlisted. Company logos (and other images) from Supabase Storage use URLs like `https://<project>.supabase.co/storage/v1/object/public/...`, which caused "Invalid src prop … hostname is not configured" when using the Image component.
- In `next.config.ts`, added `images.remotePatterns` with one entry: `protocol: "https"`, `hostname: "*.supabase.co"`, `pathname: "/storage/v1/object/public/**"`. Any Supabase project’s public storage URLs are now allowed for `next/image`.

**Key file:** `next.config.ts` – `images.remotePatterns`.

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

## Task 8: SEO (meta tags, sitemap, robots, OpenGraph, canonical)

**What was done:**

- **Site URL:** `lib/site.ts` – `getSiteUrl()` reads `NEXT_PUBLIC_SITE_URL` or falls back to localhost (server) / `window.location.origin` (client). Documented in `.env.example`.
- **Root layout:** `app/layout.tsx` – `metadataBase`, title template `%s | Niche Tech Job Board`, OpenGraph (title, description, type, locale), Twitter card (summary_large_image), robots index/follow.
- **Job detail:** `app/jobs/[slug]/page.tsx` – `generateMetadata` extended with `alternates.canonical` (`/jobs/[slug]`), OpenGraph (title, description, url, type), Twitter (card, title, description).
- **Jobs list (indexable filter pages):** `app/jobs/page.tsx` – static metadata replaced with `generateMetadata({ searchParams })`: dynamic title/description from active filters (e.g. "Jobs – remote, React"), canonical URL for current query (so each filter view has one canonical), OpenGraph and Twitter for share previews.
- **Sitemap:** `app/sitemap.ts` – dynamic sitemap: `/`, `/jobs`, and all `/jobs/[slug]` for active jobs (via `getActiveJobSlugs()` in `lib/jobs.ts`). Uses `getSiteUrl()` for base URL.
- **Robots:** `app/robots.ts` – allow `/`, disallow `/employer/`, `/profile`, `/saved-jobs`, `/login`, `/register`, `/auth/`; sitemap URL from `getSiteUrl()`.

**Key files:**

- `lib/site.ts` – getSiteUrl().
- `lib/jobs.ts` – getActiveJobSlugs() for sitemap.
- `app/layout.tsx` – default metadata + OG/Twitter.
- `app/jobs/page.tsx` – generateMetadata with searchParams, canonical, OG.
- `app/jobs/[slug]/page.tsx` – canonical, OG, Twitter.
- `app/sitemap.ts`, `app/robots.ts`.
- `.env.example` – NEXT_PUBLIC_SITE_URL.

**Notes:** Set `NEXT_PUBLIC_SITE_URL` in production (e.g. on Vercel) so sitemap, robots, and canonical/OG URLs use the real domain. Filter pages are indexable with descriptive meta and canonical URLs.

---

## Task 9: Final polish

**What was done:**

- **Skeleton loaders:** Added shadcn `Skeleton` and `Sheet` components. Created `loading.tsx` for `/jobs` (filter + job card skeletons), `/jobs/[slug]` (detail skeleton), `/employer/dashboard`, and `/saved-jobs` so navigation shows instant loading UI (per §10 UI/UX).
- **Branding:** Header label updated from "Niche Job Board" to "Niche Tech Job Board" for consistency with metadata and home.
- **Mobile header:** New client component `app/_components/header-nav.tsx` – desktop nav unchanged (hidden on small screens with `md:flex`), mobile: hamburger button opens a Sheet from the right with the same links. Header (server) passes `user` and `isEmployer` to HeaderNav.
- **Empty states:** Briefcase icon (lucide-react) added to jobs list empty state ("No jobs match your filters") and saved-jobs empty state for light visual polish.

**Key files:**

- `components/ui/skeleton.tsx`, `components/ui/sheet.tsx` (shadcn).
- `app/jobs/loading.tsx`, `app/jobs/[slug]/loading.tsx`, `app/employer/dashboard/loading.tsx`, `app/saved-jobs/loading.tsx`.
- `app/_components/header.tsx` (branding, HeaderNav), `app/_components/header-nav.tsx` (desktop + mobile menu).
- `app/jobs/page.tsx`, `app/saved-jobs/page.tsx` (empty-state icon).

**Notes:** No new features; polish only. MVP build plan (§13) complete.

---

## Not done yet (from PROJECT_BRIEF §13)

- Nothing; Task 9 completes the plan.

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

## Post-MVP enhancements (Steps 1–4)

**What was done (after Task 9):**

- **Step 1 – Apply URL/email per job:** Migration `002_job_application_fields.sql` adds `application_email` and `application_url` to `jobs`. Employer form has optional fields; job detail Apply button uses URL → email → company website → placeholder. Types and all job selects updated; `.env` unchanged.
- **Step 2 – “Posted X days ago” + Close listing:** `lib/format.ts` – `formatRelativeTime()`. Migration `003_job_closed_at.sql` adds `closed_at` to jobs. Job list and detail show “Posted X ago”; employer dashboard shows “Close listing” / “Reopen listing” via `app/employer/close-reopen-button.tsx`. When `closed_at` is set, detail shows “Position filled” and no Apply button; cards show “Filled” badge.
- **Step 3 – EU timezone quick filter:** `JobFilters.eu_timezone_friendly`; `getJobs()` filters by it when true. Jobs list has “EU timezone only” checkbox in `jobs-filter.tsx`; URL `eu_timezone_friendly=1`; metadata and canonical include it.
- **Step 4 – Public employer/company page:** `app/employer/[id]/page.tsx` – public profile (logo, name, website) + active jobs (JobCards). `lib/jobs.ts`: `getEmployerPublicProfile(id)`, `getActiveJobsByEmployer(employerId)`, `getEmployerIdsWithActiveJobs()`. Job detail links “View all jobs from this company” → `/employer/[id]`. Robots disallow only `/employer/dashboard` and `/employer/jobs`; sitemap includes `/employer/{id}` for employers with active jobs.

**Key files (steps 1–4):**

- Migrations: `002_job_application_fields.sql`, `003_job_closed_at.sql` (run after 001).
- `lib/format.ts`, `lib/types.ts` (JobFilters.eu*timezone_friendly, Job closed_at / application*\*).
- `lib/jobs.ts` (application/closed_at in selects, getEmployerPublicProfile, getActiveJobsByEmployer, getEmployerIdsWithActiveJobs).
- `app/employer/actions.ts` (closeJob, reopenJob), `app/employer/close-reopen-button.tsx`, `app/employer/[id]/page.tsx`.
- `app/jobs/jobs-filter.tsx` (EU checkbox), `app/jobs/page.tsx`, `app/jobs/[slug]/page.tsx`, `app/jobs/job-card.tsx` (postedAt, Filled badge).
- `app/sitemap.ts`, `app/robots.ts`.

**Deferred (see FUTURE.md):** Step 5 – Job alerts (email).

---

## Task 10: UI improvements (pracuj.pl inspired)

**What was done:**

- **Colors:** Updated `app/globals.css` – primary blue (#5B41E1), light lavender background (#F5F6FA), selected filter (#E8E5FB), dark grey text (#4A4A4A). Header logo uses primary color.
- **Jobs page layout:** Two-column layout – filters in left sidebar (~320px), job listings on right. Filters shown as vertical cards: Active filters (removable tags) + Filters card (search, location, EU checkbox, role, work type, tech, salary). Job count and "Sorted by newest" above listings. Background `bg-muted/30`.
- **Job cards:** Tech stack as pill-shaped tags (`bg-primary/10`); work type/job type as inline text; salary in green; FavoriteButton in top-right.
- **Homepage hero:** Split layout – left: headline "Hello World. Hello new job", large blue job count, search bar (position + location + Search button), Specializations & Popular technologies & Work mode tags (multi-select toggles). Right: decorative gradient shapes. Tags add to filters; Search submits all selections.
- **Recently posted jobs:** New section below hero – horizontal scrollable job cards with company logo, title, company, location, salary (green), posted time. "View all jobs" link. `getRecentJobs(limit)`, `getActiveJobCount()` in `lib/jobs.ts`.
- **Multi-select filters:** `JobFilters` now uses `roles?: string[]`, `tech?: string[]`, `work_types?: WorkType[]` (arrays). `getJobs()`: roles via `.or('role.ilike.%X%,role.ilike.%Y%')`, tech via `.overlaps('tech_stack', tech)`, work_types via `.in('work_type', work_types)`. URL supports repeated params (`role=Backend&role=Frontend&tech=AWS&tech=Azure&work_type=remote&work_type=hybrid`).
- **Location filter:** Added `location?: string` to JobFilters; `getJobs()` filters by `location.ilike`. Search bar and sidebar have Location input.
- **Jobs filter sidebar:** "Add role" and "Add tech" dropdowns (append to arrays); Work type as Remote/Hybrid checkboxes; active filters show one tag per value, each removable via ×.
- **Home hero components:** `app/_components/home-hero.tsx` (client, multi-select state), `app/_components/recent-jobs.tsx` (server-rendered cards).

**Key files:**

- `app/globals.css` – color variables.
- `app/page.tsx` – fetches jobCount, recentJobs, filterOptions; renders HomeHero + RecentJobs.
- `app/_components/home-hero.tsx` – hero with search form and multi-select tags.
- `app/_components/recent-jobs.tsx` – horizontal job cards.
- `app/_components/header.tsx` – logo uses `text-primary`.
- `app/jobs/page.tsx` – two-column layout, parseFilters/buildJobsQueryString for arrays.
- `app/jobs/jobs-filter.tsx` – sidebar filters, add role/tech dropdowns, work type checkboxes, per-value remove.
- `app/jobs/job-card.tsx` – pill tags, inline metadata.
- `lib/types.ts` – JobFilters with roles, tech, work_types arrays; location.
- `lib/jobs.ts` – getRecentJobs, getActiveJobCount, getJobs with array filters, location filter.

**Notes:** Hero search and tags build URL with repeated params; jobs page parses via `getParamArray`. Sitemap and metadata updated for array filters.

---

## Homepage UX updates (post Task 10)

**What was done:**

- **Work time dropdown:** Moved outside the main search bar container into its own row below; styled as a standalone control.
- **Location dropdown:** Replaced plain input with a Select dropdown; options include Any location, Remote, Berlin, London, Amsterdam, New York, San Francisco. Styled with `rounded-lg`, `shadow-lg` for a cleaner look.
- **Recently posted jobs & Companies worth knowing:** Scrollbars hidden via `.scrollbar-hide` utility; horizontal drag-to-scroll enabled (no visible scrollbar, users drag left/right). `lib/use-drag-scroll.ts` hook handles mousedown/move/up and prevents link navigation when dragging.
- **Primary color:** Switched from purple (#5B41E1) to #4855c6 (`hsl(234, 52%, 53%)`) in `app/globals.css` for both light and dark themes. Secondary, accent, and ring updated accordingly. Replaced hardcoded `#E8E5FB` with `bg-primary/10` where applicable.

**Key files:**

- `app/_components/home-hero.tsx` – Work time moved out, Location Select, `bg-primary/10`.
- `app/_components/recent-jobs.tsx` – `useDragScroll`, `scrollbar-hide`, `cursor-grab`.
- `app/_components/companies-worth-knowing.tsx` – new section, same drag/scrollbar behavior.
- `lib/use-drag-scroll.ts` – drag-to-scroll hook with `onClickCapture` to block link clicks during drag.
- `app/globals.css` – primary 234 52% 53%, `scrollbar-hide` utility.
- `app/jobs/[slug]/page.tsx` – `bg-primary/10` for tags.

**Notes:** Companies worth knowing uses `getEmployersForHomepage()` from `lib/jobs.ts`. Chevron buttons still work for scroll navigation.

---

## Dual registration & application flow (Steps 1–4)

**What was done:**

- **Migration 006 – User & company profiles + applications:** New enum `application_preference` ('website' | 'email'). On `profiles`: added `last_name`, `phone_number`, `cv_file_url`, `company_about`, `company_location`, `application_preference`. Trigger `handle_new_user` updated to set these from signup metadata. New table `applications` (job*id, applicant_id, applicant*_, cv*url, cover_letter*_, status, applied_at) with RLS: users can insert/view own; employers can view for their jobs.
- **Types (`lib/types.ts`):** `ProfileRole`, `ApplicationPreference`, full `Profile`, `UserProfile`, `CompanyProfile`, `Application`, `ApplicationFormData`, `APPLICATION_PREFERENCES`. `Job.employer` extended with optional `company_about`, `company_location`, `application_preference`.
- **Separate registration:** `/register` shows two cards (Job Seeker / Company). `/register/user` – form: first name, last name, email, phone, password; signUp with `role: 'job_seeker'`, `full_name`, `last_name`, `phone_number`. `/register/company` – form: company name, logo URL (optional), about, location, website (optional), application preference (email vs website), email, password; signUp with `role: 'employer'` and company metadata. Old single `RegisterForm` at `app/register/register-form.tsx` is unused.
- **Storage (migration 007 + `lib/storage.ts`):** Buckets `user-cvs` (private, 10 MB, PDF/DOC/DOCX) and `company-logos` (public, 2 MB, images). Paths `{user_id}/{filename}`. RLS so users manage only their own folder. Helpers: `uploadCv`, `uploadLogo`, `deleteStorageFile`, `getPublicUrl`, `createSignedCvUrl`. Validation: `CV_ALLOWED_TYPES/EXTENSIONS`, `LOGO_*`, `isAllowedCvType`, `isAllowedLogoFileName`, etc. **Note:** `profiles.cv_file_url` stores the **path** (e.g. `userId/file.pdf`); use `createSignedCvUrl` when a URL is needed.

**Key files:**

- `supabase/migrations/006_user_and_company_profiles.sql`, `007_storage_buckets.sql`
- `lib/types.ts` (Profile, Application, APPLICATION_PREFERENCES)
- `lib/storage.ts` (upload/delete/signed URL, validation)
- `app/register/page.tsx` (two cards), `app/register/user/*`, `app/register/company/*`

**Not done yet (continue in new chat):** (None; apply flow done in next section.)

---

## Step 5 – Profile page updates (user + company)

**What was done:**

- **Profile page (`app/profile/page.tsx`):** Fetches full profile (last_name, phone_number, cv_file_url, company_about, company_location, application_preference, company_logo_url). Builds signed CV URL via `createSignedCvUrl` when user has a CV; passes profile + `cvDownloadUrl` to the form.
- **Profile actions (`app/profile/actions.ts`):** `updateProfile(data)` for all text/select fields; `uploadCvAndUpdateProfile(formData)` / `deleteCvAndUpdateProfile()` for CV (path stored in `cv_file_url`); `uploadLogoAndUpdateProfile(formData)` / `deleteLogoAndUpdateProfile()` for logo (public URL stored in `company_logo_url`; path derived from URL for delete). `getSignedCvUrl()` for optional client-side refresh of download link.
- **Profile form (`app/profile/profile-form.tsx`):** Uses `Profile` from `lib/types`. **User (job seeker):** First name, last name, phone number; CV card with current file name, Download (signed URL), Replace, Delete. **Employer:** Company name, website, about (textarea), location, application preference (Select); logo card with preview, Upload/Replace, Delete. File inputs use `lib/storage` validation (CV: PDF/DOC/DOCX; logo: JPG/PNG/WebP/GIF). After upload/delete, `router.refresh()` so page re-fetches profile and signed URL.

**Key files:**

- `app/profile/page.tsx` – server; full profile + signed CV URL.
- `app/profile/actions.ts` – updateProfile, upload/delete CV, upload/delete logo.
- `app/profile/profile-form.tsx` – Account card (name, phone, role), CV card (job seeker), logo card (employer), sign out.

**Notes:** CV is private bucket (path in DB, signed URL for download). Logo is public bucket (full URL in DB for display; path parsed from URL for delete). Role switch still in form; employer-only fields and company logo only shown when role is employer.

---

## Apply flow – /jobs/[slug]/apply, form, email to employer

**What was done:**

- **Apply button:** When job has `application_email` and employer `application_preference === 'email'`, job detail "Apply" links to `/jobs/[slug]/apply` instead of mailto. Otherwise unchanged (application_url → external, application_email without preference → mailto, etc.).
- **getJobBySlug:** Employer select now includes `application_preference` so apply CTA can choose in-app vs external.
- **Apply page (`app/jobs/[slug]/apply/page.tsx`):** Requires login (redirect to login with `next`). Loads job by slug; if closed or no application_email or preference ≠ email, redirects to job. Fetches user profile for prefills and CV; builds signed CV URL for form. Renders `ApplicationForm` with job, slug, prefilled name/last name/email/phone, hasCv, cvDownloadUrl, cvFileName.
- **Application form (`application-form.tsx`):** First/last name, email, phone (prefilled), note that CV comes from profile (link to profile); cover letter optional. If no CV, shows warning and disables submit. Submit → `submitApplication(slug, formData)`.
- **Submit action (`apply/actions.ts`):** Auth check; load job (must have application_email and employer preference email); require profile CV; prevent duplicate application (same applicant_id + job_id); create 24h signed CV URL; insert into `applications` (cv_url = path); call `sendApplicationNotification` to job.application_email. On email failure, log and still return success (application saved).
- **Email (`lib/email.ts`):** `sendApplicationNotification(params)` – plain-text email with applicant name, email, phone, cover letter, and CV download link (signed URL). Uses Resend when `RESEND_API_KEY` is set; otherwise no-op. `.env.example`: optional `RESEND_API_KEY`, `RESEND_FROM`.

**Key files:**

- `lib/jobs.ts` – getJobBySlug employer includes application_preference.
- `app/jobs/[slug]/page.tsx` – getApplyProps(job, slug) → /jobs/[slug]/apply when preference email.
- `app/jobs/[slug]/apply/page.tsx`, `application-form.tsx`, `apply/actions.ts`.
- `lib/email.ts` – sendApplicationNotification (Resend).

**Notes:** One application per user per job. CV is read from profile only (no one-off upload on apply). Employer sees applications in DB; email is optional (Resend). For employer dashboard viewing applications (list + CV download), add later if needed.

---

## Profile, CV, navbar, apply UX (plan implementation)

**What was done:**

- **Lock role:** Profile form no longer lets users switch between Job seeker and Employer. Role is shown as read-only text; `updateProfile` no longer accepts or updates `role` (server reads current role from DB for company fields).
- **Company logo on apply form:** Application form card shows employer logo (or initials) next to "Apply for {job.title}" in the header.
- **Second Apply CTA:** Job detail page has an apply card at the bottom of the main column (below Description), reusing the same apply link/note; Share stays in sidebar only.
- **Navbar account dropdown:** Added `components/ui/dropdown-menu.tsx` (Radix). When logged in: Jobs and Blog are in the header **left** next to the logo; right side has heart icon (link to /saved-jobs), Dashboard (if employer), and a single **account** control (User icon + first name as one button) opening a dropdown with Edit, Saved Jobs, Sign out. First name comes from profile `full_name` (first word). Mobile sheet still lists Jobs, Blog, Saved Jobs, Dashboard, Edit, Sign out.
- **Up to 3 CVs per user:** Migration `008_user_cvs.sql` – table `user_cvs` (id, user_id, storage_path, display_name, created_at), RLS, backfill from `profiles.cv_file_url`, then drop `profiles.cv_file_url`. Profile page loads CVs from `user_cvs`; profile form shows list (download + delete per CV), "Add CV" when count < 3. Actions: `addCvToUserCvs`, `deleteCvFromUserCvs`. Apply flow uses first CV from `user_cvs` when no file/chosen path.
- **Apply form: attach CV from form or saved:** Submit action accepts `FormData` with optional `cv_file` (upload) or `cv_path` (chosen saved CV). If file provided, upload to storage and use path; else if chosen path (validated against user_cvs), use it; else first from user_cvs. Apply form: "CV for this application" – radio list of saved CVs (if any) plus "Or upload a different file"; if no saved CVs, file upload only. Submit sends FormData; application stores chosen/uploaded path in `applications.cv_url`.
- **Typography:** Open Sans (body) and Work Sans (headings) via `next/font/google`; CSS variables on `<html>`, body uses Open Sans, h1–h6 use `font-heading` (Work Sans) and `text-heading` (#202557). h2 font-size 18px in `globals.css`. Tailwind: `font-sans` = Open Sans, `font-heading` = Work Sans, `heading` color.
- **Header layout:** Logo + Jobs + Blog on the **left** (header.tsx); right side is HeaderNav only (heart, Dashboard, account dropdown). Nav bar font size increased to `text-base`.
- **Homepage hero:** Work time moved **below** the Specializations / Popular technologies / Work mode card. Work time is a **link-style** control (text + chevron) that opens a dropdown (Any, Full-time, Part-time, etc.), not a button. Location on home hero remains a **Select** (Any location, Remote, Berlin, London, etc.). Jobs filter location remains a plain **Input** (type only).

**Key files:**

- `app/profile/profile-form.tsx`, `app/profile/actions.ts` – role locked; CV list from user_cvs.
- `app/profile/page.tsx` – fetches user_cvs, passes `cvs` to form.
- `supabase/migrations/008_user_cvs.sql` – user_cvs table, backfill, drop cv_file_url.
- `lib/types.ts` – Profile without cv_file_url; UserCv type.
- `app/_components/header.tsx` – logo + Jobs + Blog left; `app/_components/header-nav.tsx` – heart, account dropdown, first name in trigger.
- `app/jobs/[slug]/apply/page.tsx`, `application-form.tsx`, `apply/actions.ts` – FormData, saved CVs list, optional file or chosen path; company logo in form.
- `app/jobs/[slug]/page.tsx` – bottom apply CTA card.
- `app/layout.tsx` – Open_Sans, Work_Sans, variable classes on html.
- `app/globals.css` – h1–h6 font-heading text-heading; h2 font-size 18px.
- `tailwind.config.ts` – fontFamily.sans, fontFamily.heading; color heading.
- `app/_components/home-hero.tsx` – Work time link + dropdown below card; location Select unchanged.

**Notes:** Run migration 008 in Supabase SQL Editor (create user_cvs, backfill, drop profiles.cv_file_url). Resend: set `RESEND_API_KEY` (and optionally `RESEND_FROM`) for application emails. Blog link goes to `/blog` (placeholder page).

---

## My Applications page

**What was done:**

- **Data layer:** `lib/jobs.ts` – `getApplicationsByApplicant(userId)` fetches applications with nested `jobs(...)` and `jobs.profiles(...)` (same job/employer shape as getFavoritedJobs), ordered by `applied_at` desc. Returns `ApplicationWithJob[]` (id, status, applied_at, job with employer).
- **Types:** `lib/types.ts` – `ApplicationWithJob` (id, status, applied_at, job: Job).
- **Page:** `app/my-applications/page.tsx` – server page; redirect to login if not authenticated; lists user's applications as cards (company logo, job title link to `/jobs/[slug]`, company name, work_type/job_type/role/salary/location badges, tech stack); each card shows "Applied X ago" (`formatRelativeTime`) and status badge; empty state with link to browse jobs.
- **Navigation:** Account dropdown and mobile sheet – "My applications" link (below Saved Jobs).
- **Loading:** `app/my-applications/loading.tsx` – skeleton list. **Robots:** `/my-applications` in disallow list.

**Key files:**

- `lib/types.ts` (ApplicationWithJob), `lib/jobs.ts` (getApplicationsByApplicant).
- `app/my-applications/page.tsx`, `app/my-applications/loading.tsx`.
- `app/_components/header-nav.tsx` (My applications link), `app/robots.ts`.

**Notes:** Only in-app applications (submitted via apply form) appear. Status displayed as stored (e.g. pending) with simple capitalization.

---

## Saved Searches

**What was done:**

- **Database:** Migration `009_saved_searches.sql` – table `saved_searches` (id, user_id → profiles, name, filters jsonb, created_at), index on user_id, RLS (users SELECT/INSERT/DELETE own rows).
- **Types:** `lib/types.ts` – `SavedSearch` (id, user_id, name, filters: JobFilters, created_at).
- **Shared filter helpers:** `lib/job-filters.ts` – `parseFilters`, `buildJobsQueryString`, `getParamArray`, `formatFiltersSummary`; used by jobs page and saved-searches so URLs match.
- **Data layer:** `lib/saved-searches.ts` – `getSavedSearches(userId)`, `createSavedSearch(userId, name, filters)` (max 20 per user, name max 200 chars), `deleteSavedSearch(id, userId)`.
- **Jobs page:** `app/jobs/page.tsx` uses `parseFilters`/`buildJobsQueryString` from `lib/job-filters`; passes `isLoggedIn` to JobsFilter. **Save button:** `app/jobs/save-search-button.tsx` – "Save this search" in a Dialog (name input); placed at bottom of **Active filters** card in `app/jobs/jobs-filter.tsx` when user is logged in and has active filters.
- **Actions:** `app/saved-searches/actions.ts` – `createSavedSearchAction(name, filters)`, `deleteSavedSearchAction(id)`; auth check, revalidatePath `/saved-searches`.
- **Saved searches page:** `app/saved-searches/page.tsx` – server page; redirect if not logged in; list of saved searches (name, filter summary, "Run search" → `/jobs?…`, delete button); empty state with link to browse jobs. `app/saved-searches/delete-search-button.tsx` – client delete with confirm, router.refresh().
- **Navigation:** Account dropdown and mobile sheet – "Saved searches" below "My applications".
- **Loading:** `app/saved-searches/loading.tsx`. **Robots:** `/saved-searches` in disallow. **UI:** `components/ui/dialog.tsx` (Radix Dialog for save-search modal).

**Key files:**

- `supabase/migrations/009_saved_searches.sql`, `lib/types.ts` (SavedSearch), `lib/job-filters.ts`, `lib/saved-searches.ts`.
- `app/jobs/page.tsx`, `app/jobs/jobs-filter.tsx` (isLoggedIn, SaveSearchButton in Active filters card), `app/jobs/save-search-button.tsx`.
- `app/saved-searches/actions.ts`, `app/saved-searches/page.tsx`, `app/saved-searches/delete-search-button.tsx`, `app/saved-searches/loading.tsx`.
- `app/_components/header-nav.tsx`, `app/robots.ts`, `components/ui/dialog.tsx`.

**Notes:** Run migration 009 in Supabase SQL Editor. "Save this search" appears only when there are active filters and user is logged in. Run search links to `/jobs` with query string; delete uses server action + refresh.

---

## Quick reference

| Need to…                                    | Look at…                                                                                                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change Supabase env                         | `.env.local`, `.env.example`                                                                                                                                |
| Change DB or RLS                            | `supabase/migrations/001_initial_schema.sql` (then re-run or add new migration)                                                                             |
| Fix auth (login/register)                   | `app/login/*`, `app/register/*`, `app/auth/callback/route.ts`                                                                                               |
| Fix profile                                 | `app/profile/*`, RLS on `profiles`                                                                                                                          |
| Fix header / auth state                     | `app/_components/header.tsx`, `app/layout.tsx`                                                                                                              |
| Jobs list / filters                         | `app/jobs/page.tsx`, `app/jobs/jobs-filter.tsx`, `app/jobs/job-card.tsx`, `lib/jobs.ts`                                                                     |
| Job detail                                  | `app/jobs/[slug]/page.tsx`, `lib/jobs.ts`                                                                                                                   |
| Employer dashboard / CRUD                   | `app/employer/dashboard/*`, `app/employer/jobs/*`, `app/employer/actions.ts`, `app/employer/job-form.tsx`, `lib/jobs.ts`                                    |
| Favorites / saved jobs                      | `app/favorites/*`, `app/saved-jobs/*`, `app/jobs/job-card.tsx`, `lib/jobs.ts`                                                                               |
| My applications                             | `app/my-applications/page.tsx`, `lib/jobs.ts` (getApplicationsByApplicant), `lib/types.ts` (ApplicationWithJob)                                             |
| Saved searches                              | `app/saved-searches/*`, `app/jobs/save-search-button.tsx`, `app/jobs/jobs-filter.tsx`, `lib/saved-searches.ts`, `lib/job-filters.ts`, migration 009         |
| SEO (sitemap, robots, meta)                 | `app/sitemap.ts`, `app/robots.ts`, `lib/site.ts`, layout + jobs metadata                                                                                    |
| Loading / polish                            | `app/*/loading.tsx`, `app/_components/header-nav.tsx`, skeleton + empty states                                                                              |
| Apply URL/email, close listing              | `lib/jobs.ts`, `app/employer/job-form.tsx`, `app/employer/actions.ts`, `app/employer/close-reopen-button.tsx`, migrations 002–003                           |
| EU timezone filter                          | `app/jobs/jobs-filter.tsx`, `lib/jobs.ts` (getJobs), `lib/types.ts` (JobFilters)                                                                            |
| Public employer page                        | `app/employer/[id]/page.tsx`, `lib/jobs.ts` (getEmployerPublicProfile, getActiveJobsByEmployer)                                                             |
| Job alerts (later)                          | See `FUTURE.md`                                                                                                                                             |
| Homepage hero, recent jobs, companies       | `app/_components/home-hero.tsx`, `app/_components/recent-jobs.tsx`, `app/_components/companies-worth-knowing.tsx`, `app/page.tsx`, `lib/use-drag-scroll.ts` |
| Multi-select filters                        | `lib/types.ts` (roles, tech, work_types arrays), `lib/jobs.ts` (getJobs), `app/jobs/jobs-filter.tsx`                                                        |
| Add UI components                           | `npx shadcn@latest add <component>`, `components/ui/`                                                                                                       |
| Supabase client in component                | Client: `lib/supabase/client.ts`. Server: `lib/supabase/server.ts` (await).                                                                                 |
| Dual registration, profiles, storage, apply | Migrations 006–007, `lib/types.ts`, `lib/storage.ts`, `lib/email.ts`, `app/register/*`, `app/profile/*`, `app/jobs/[slug]/apply/*`.                         |
| User CVs (up to 3), apply with file/saved   | Migration 008, `user_cvs` table, `app/profile/*`, `app/jobs/[slug]/apply/*`, `lib/types.ts`.                                                                |
| Header (Jobs, Blog, account, heart)         | `app/_components/header.tsx`, `app/_components/header-nav.tsx`, `components/ui/dropdown-menu.tsx`.                                                          |
| Fonts, heading color                        | `app/layout.tsx` (Open_Sans, Work_Sans), `app/globals.css`, `tailwind.config.ts`.                                                                           |
| Hydration (extension-injected attributes)   | `components/hydration-safe-div.tsx`, `app/_components/home-hero.tsx`, `recent-jobs.tsx`, `companies-worth-knowing.tsx`, `app/page.tsx`, `app/layout.tsx`.   |
| Next.js Image + Supabase storage            | `next.config.ts` (images.remotePatterns for \*.supabase.co).                                                                                                |
| Specialization / tech stack / work mode     | `lib/types.ts`, `lib/jobs.ts`, `app/employer/job-form.tsx`, `app/jobs/jobs-filter.tsx`, `app/jobs/page.tsx`.                                                 |
| Homepage hero collapse, tech icons          | `app/_components/home-hero.tsx`, `next.config.ts`.                                                                                                          |

---

## Job form & filter improvements

**What was done:**

- **Specialization field:** Replaced the "Role / position" plain input in the employer job form with a multi-select tag picker. `SPECIALIZATIONS` constant added to `lib/types.ts` (22 options: Backend, Frontend, Full-stack, Mobile, Architecture, DevOps, Game dev, Data analyst & BI, Big Data / Data Science, Embedded, QA/Testing, Security, Helpdesk, Product Management, Project Management, Agile, UI/UX, Business analyst, System analyst, SAP&ERP, IT admin, AI/ML). Selected specializations shown as removable badges; presets shown as clickable tags; custom values via comma-separated input. Multiple specializations stored as comma-separated string in `jobs.role` column (no DB migration). `"UX/UI"` renamed to `"UI/UX"`.
- **Tech stack field:** Moved immediately below Specialization (above Description) in the form. Changed from free-text input to tag picker: `TECH_STACK_OPTIONS` constant (20 options) as clickable presets, removable badges for selected items, custom input (comma-separated). `TECH_STACK_OPTIONS` added to `lib/types.ts`.
- **Work type → Work mode:** Renamed label in the job form, jobs filter sidebar and horizontal layout, active filter tags ("Work:" → "Work mode:"), and jobs page metadata description strings.
- **Specialization in filters:** "Role" → "Specialization" in sidebar label, horizontal placeholder, and "Add role" → "Add specialization". Active filter tag updated to "Specialization:". `getFilterOptions` in `lib/jobs.ts` now returns `roles = [...SPECIALIZATIONS]` (fixed list, not merged with DB values) to prevent comma-separated multi-specialization strings from appearing as single filter options. Tech still merges `TECH_STACK_OPTIONS` with distinct DB values.

**Key files:**

- `lib/types.ts` – `SPECIALIZATIONS`, `TECH_STACK_OPTIONS` constants.
- `lib/jobs.ts` – `getFilterOptions` uses fixed SPECIALIZATIONS for roles.
- `app/employer/job-form.tsx` – Specialization tag picker, tech stack tag picker (moved), Work mode label.
- `app/jobs/jobs-filter.tsx` – Specialization/Work mode labels, active filter text.
- `app/jobs/page.tsx` – Metadata descriptions updated.

---

## Homepage hero: tech icons, collapse, selected counts

**What was done:**

- **Tech icons:** Technology buttons now show colored icons from the [devicon](https://github.com/devicons/devicon) library via jsDelivr CDN (`cdn.jsdelivr.net`). Each tech (JavaScript, HTML5, Python, Node.js, TypeScript, PHP, C++, React.js, C#, Go, Rust, .NET, Angular, Android, iOS, Ruby) is mapped to a devicon `-original.svg`. C and AWS use inline SVG data URIs as fallbacks (no CDN dependency). `react-icons` installed for potential future use. `next.config.ts` updated with `cdn.jsdelivr.net` remote pattern.
- **Technology order:** Fixed display order (JavaScript, HTML, Python, Java, SQL, Node.js, TypeScript, PHP, C++, React.js, then remaining). Not alphabetical.
- **Specialization collapse:** First 10 specializations shown by default (expanded by default, i.e. all visible). "Show more (N)" / "Show less" toggle button after the last visible item. State: `specializationsExpanded` (default `true`).
- **Technology collapse:** First 10 technologies shown; "Show more (N)" / "Show less" button. State: `techExpanded` (default `false`).
- **Selected counts:** Green circular badge (solid green bg, white text) appears next to "Specialization" and "Technologies" labels showing how many items are currently selected. Only shown when count > 0.

**Key files:**

- `app/_components/home-hero.tsx` – `DEVICON_CDN`, `DEVICON_ICONS` map, `C_ICON_FALLBACK`, `AWS_ICON_FALLBACK`, `getTechIconUrl`, `HOME_TECH_ORDER`, collapse state, count badges.
- `next.config.ts` – `cdn.jsdelivr.net` in `images.remotePatterns`.
- `package.json` – `react-icons` added.

---

## Job form UX: list items, layout, styling, and pages

**What was done:**

- **List items one-by-one:** Responsibilities, Requirements, What we offer, Good to have, and Benefits no longer use textareas. Each uses a reusable `ListItemField`: single input + "Add" button (Enter to add), removable list rows, no duplicate items. Data still stored as newline-separated strings; form state is `string[]`, joined with `\n` in `buildForm()`. `parseLines()` helper splits saved values for edit mode.
- **Form layout:** Description, Work time, and Work mode moved below Benefits. Work time and Work mode use switch-style button groups (two options each) instead of dropdowns. Card header ("New job listing" / "Edit job") and its description removed from the form card.
- **Required fields:** Job title *, Specialization *, Summary *; Responsibilities *, Requirements *, and What we offer * are required (validation in `handleSubmit`). All form labels use 18px. Helper text under Specialization, Tech stack, Application email/URL, and under section titles removed.
- **Section dividers:** Thin gradient lines (`from-transparent via-border to-transparent`) between form sections with vertical spacing. Form uses `space-y-0` with separator divs.
- **Field and button styling:** Inputs use shared `fieldInputClass` (h-11, rounded-lg, border-border/80, shadow-sm, focus ring). Textareas auto-resize (`AutoResizeTextarea`), rounded-lg. List item rows: rounded-lg, bg-muted/30, hover. Specialization and Tech stack option chips: rounded-full, border-2 border-secondary, bg-secondary/50, hover scale. Work time/mode toggles: rounded-lg group, selected = primary, unselected = card with hover. Primary submit button size lg, rounded-lg, shadow; Cancel/Delete same sizing.
- **Form card:** Uses utility `bg-form-card` (subtle diagonal gradient + light diagonal stripe pattern). Form wrapped in `Card` with `rounded-xl border-border/80 shadow-lg`.
- **New job page:** `app/employer/jobs/new/page.tsx` – main has `bg-form-page`, container `max-w-4xl`, padding `py-10` / `sm:px-6`. Back link with `ArrowLeft` icon and "Back to dashboard". Header block with title and subtitle. Same layout and styling applied to **edit job page** (`app/employer/jobs/[id]/edit/page.tsx`): `bg-form-page`, `max-w-4xl`, same back link and header pattern.
- **Color palette:** `app/globals.css` – rustic theme: terracotta primary (18 65% 42%), sage secondary (85 22% 88%), cream background (40 33% 97%), warm brown foreground, clay accent. Dark mode: deep warm brown backgrounds, same hue family.
- **Background utilities:** `.bg-form-page` – light gradient + dot pattern for employer form pages (radial gradients and repeating dot grid). `.bg-form-card` – subtle gradient + diagonal stripe pattern for the job form card. Both reduced in intensity (lighter opacities) for a softer look.
- **Home hero gradient:** Hero section has a stronger background gradient: `from-muted via-muted/70 to-background`. Overlay gradients increased (primary tint and bottom muted) for more depth.

**Key files:**

- `app/employer/job-form.tsx` – `ListItemField`, `AutoResizeTextarea`, `parseLines`, array state for the five list fields, section dividers, field/button/chip styles, Work time/mode switches, required validation.
- `app/employer/jobs/new/page.tsx` – `bg-form-page`, max-w-4xl, back link, header.
- `app/employer/jobs/[id]/edit/page.tsx` – same layout and styling as new job page.
- `app/globals.css` – `:root` / `.dark` rustic palette; `.bg-form-page`, `.bg-form-card` utilities.
- `app/_components/home-hero.tsx` – hero `bg-gradient-to-b from-muted via-muted/70 to-background`, stronger overlay gradients.

**Notes:** Job form remains a single shared component for create and edit; only the page wrappers differ. Storage and API for list fields unchanged (newline-separated strings).

