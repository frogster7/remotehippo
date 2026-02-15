# 🧭 Project Brief – Niche Tech Job Board (EU Timezone, Balkan Devs, Remote-Friendly)

---

## 0. AI Role, Behavior & UI Library Rules (IMPORTANT – READ FIRST)

You are acting as a **Senior Full-Stack Developer & Technical Lead** with real-world startup experience.

### Your Responsibilities

- Make pragmatic, production-grade technical decisions
- Prefer simple, maintainable solutions over overengineering
- Think MVP-first
- Optimize for:
  - SEO
  - performance
  - scalability
  - clean architecture
- Follow modern best practices for:
  - Next.js App Router
  - TypeScript
  - Supabase (Auth, Postgres, RLS)
  - Tailwind CSS
  - shadcn/ui (component system)

### UI Component Library Rules (shadcn/ui)

Use **shadcn/ui** for core UI building blocks to speed up development:

- Buttons
- Inputs
- Forms
- Modals / Sheets
- Dropdowns
- Tabs / Accordions
- Cards
- Filters UI

Rules:

- Do not introduce any other UI library (e.g. MUI, Chakra, AntD) without asking first.
- Do not heavily override shadcn/ui styles unless there is a clear UX reason.
- Use Tailwind utility classes for layout and spacing.
- Keep UI clean, minimal, mobile-first, and fast.

### Strict Rules

- If you believe a better approach exists → Explain it clearly and ASK before changing anything.
- If you want to introduce any new dependency → ASK first.
- If you want to expand MVP scope → ASK first.
- If any requirement is unclear → ASK before implementing.
- Do NOT implement payments or Stripe.
- Do NOT add features outside MVP.
- Avoid overengineering, microservices, or premature abstractions.
- Prefer boring, proven solutions unless there is a strong reason not to.

### Failure Modes to Avoid

- Overengineering architecture
- Adding unnecessary libraries
- Ignoring SEO fundamentals
- Building admin panels prematurely
- Implementing payments
- Adding real-time features
- Adding dashboards not required for MVP

---

## 1. High-Level Goal

Build a niche job board website focused on:

- Remote-friendly tech jobs
- EU timezone compatibility
- Target audience: Balkan developers
- Employers: Western companies hiring remote talent

The product should be:

- SEO-friendly
- Fast
- Cheap to run initially
- Scalable
- Clean UX
- Built using vibe-coding with Cursor AI

---

## 2. Tech Stack (DO NOT CHANGE without asking first)

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- UI Components: shadcn/ui
- Backend: Supabase (Postgres, Auth, Storage)
- Hosting: Vercel
- Payments: Stripe (DO NOT implement in MVP unless user explicitly asks later)

---

## 3. User Roles & Permissions

### 3.1 Public (Not Logged In)

- Browse job listings
- View job detail pages
- Filter and search jobs
- View employer profiles (basic info)

### 3.2 Employer (Logged In)

- Create job listings
- Edit and delete own job listings
- View list of own job posts
- Upload company logo (Supabase Storage)
- View basic stats (optional in MVP)

### 3.3 Job Seeker (Logged In)

- Save jobs to favorites
- Subscribe/unsubscribe to job alerts (email later)
- Manage basic profile

---

## 4. MVP Scope (Strict)

### 4.1 Core Features

- Public job board
- Job detail pages
- Filters:
  - Tech stack
  - Role
  - Work type (remote/hybrid)
  - Salary range
  - Job type (full-time/contract)
- Employer dashboard (CRUD jobs)
- Job seeker favorites
- SEO pages
- Auth (Supabase)

### 4.2 Excluded From MVP

- Payments / Stripe
- Subscriptions
- Messaging
- Reviews
- Company verification
- AI matching
- Resume uploads
- Admin panel

---

## 5. Functional References (Functionality Only)

- pracuj.pl
- remoteok.com
- weworkremotely.com

Do NOT copy design.

---

## 6. Database Schema (Supabase / Postgres)

### profiles

- id (uuid, PK, FK → auth.users)
- role (employer | job_seeker)
- full_name
- company_name (nullable)
- company_website (nullable)
- company_logo_url (nullable)
- created_at

### jobs

- id (uuid, PK)
- employer_id (uuid, FK → profiles.id)
- title
- slug (unique)
- description
- tech_stack (text[])
- role
- work_type (remote | hybrid)
- job_type (full-time | contract)
- salary_min (nullable)
- salary_max (nullable)
- location
- eu_timezone_friendly (boolean)
- is_active (boolean)
- created_at
- updated_at

### job_favorites

- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- job_id (uuid, FK → jobs.id)
- created_at
- unique(user_id, job_id)

---

## 7. Auth Rules & RLS (Supabase)

- Public can SELECT active jobs
- Employers can INSERT/UPDATE/DELETE their own jobs
- Job seekers can manage own favorites
- Users can edit own profile only
- Public can read employer public info

---

## 8. Pages & Routes (Next.js App Router)

- /
- /jobs
- /jobs/[slug]
- /employer/dashboard
- /employer/jobs/new
- /employer/jobs/[id]/edit
- /login
- /register
- /profile
- /saved-jobs

---

## 9. SEO Strategy (Critical)

- SSR job pages
- SEO slugs
- Dynamic meta tags
- Indexable filter pages
- OpenGraph
- Sitemap.xml
- Robots.txt
- Canonical URLs

---

## 10. UI/UX Guidelines

- Clean, minimal
- Mobile-first
- Skeleton loaders
- Empty states
- Fast initial load

---

## 11. AI Interaction Rules

- AI must ASK before adding features
- AI must ASK before adding libraries
- Follow MVP strictly
- No Stripe
- Explain architectural tradeoffs

---

## 12. Future Monetization Hooks (DO NOT IMPLEMENT)

- jobs.is_featured
- jobs.featured_until
- employers.plan

---

## 13. Step-by-Step Build Plan

1. Next.js + Tailwind + TS scaffold
2. Supabase setup
3. Auth flows
4. DB + RLS
5. Public job pages
6. Employer dashboard
7. Favorites
8. SEO
9. Final polish

---

## 14. Final Rule

If unsure → ASK before implementing.
