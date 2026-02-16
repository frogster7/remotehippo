# Supabase setup

## 1. Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## 3. Run the migration

In the Supabase Dashboard, open **SQL Editor** and run the contents of:

**`supabase/migrations/001_initial_schema.sql`**

Then run **`supabase/migrations/002_job_application_fields.sql`** (application email/URL per job) and **`supabase/migrations/003_job_closed_at.sql`** (optional “position filled” / close listing).

The first migration creates:

- Tables: `profiles`, `jobs`, `job_favorites`
- Enums: `profile_role`, `work_type`, `job_type`
- Trigger: create a `profiles` row when a user signs up
- RLS policies as per PROJECT_BRIEF §7

Also run **`006_user_and_company_profiles.sql`** and **`007_storage_buckets.sql`** when using separate user/company registration and file uploads (CVs, logos).

(Optional: if you use the Supabase CLI, run `supabase db push` from the project root.)

## 4. Auth redirect URL (for email confirmation / OAuth)

In **Authentication → URL Configuration**, add to **Redirect URLs**:

- `http://localhost:3000/auth/callback` (development)
- Your production URL, e.g. `https://yourdomain.com/auth/callback`
