-- Niche Job Board: initial schema (profiles, jobs, job_favorites)
-- Run this in Supabase Dashboard > SQL Editor, or via Supabase CLI.

-- Enums for type safety
CREATE TYPE public.profile_role AS ENUM ('employer', 'job_seeker');
CREATE TYPE public.work_type AS ENUM ('remote', 'hybrid');
CREATE TYPE public.job_type AS ENUM ('full-time', 'contract');

-- Profiles: extends auth.users (one row per user)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.profile_role NOT NULL DEFAULT 'job_seeker',
  full_name text,
  company_name text,
  company_website text,
  company_logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Jobs
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  tech_stack text[] DEFAULT '{}',
  role text NOT NULL,
  work_type public.work_type NOT NULL,
  job_type public.job_type NOT NULL,
  salary_min integer,
  salary_max integer,
  location text,
  eu_timezone_friendly boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_slug ON public.jobs(slug);
CREATE INDEX idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX idx_jobs_is_active_created ON public.jobs(is_active, created_at DESC);

-- Job favorites (job seekers)
CREATE TABLE public.job_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX idx_job_favorites_user_id ON public.job_favorites(user_id);
CREATE INDEX idx_job_favorites_job_id ON public.job_favorites(job_id);

-- Updated_at trigger for jobs
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create profile on signup (trigger on auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.profile_role,
      'job_seeker'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- RLS (Row Level Security)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_favorites ENABLE ROW LEVEL SECURITY;

-- Profiles: public can read (employer public info), users can update/delete own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Jobs: public can read active jobs; employers can read/insert/update/delete own
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs FOR SELECT USING (
    is_active = true OR employer_id = auth.uid()
  );

CREATE POLICY "Employers can insert own jobs"
  ON public.jobs FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own jobs"
  ON public.jobs FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs"
  ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

-- Job favorites: users manage own rows only
CREATE POLICY "Users can view own favorites"
  ON public.job_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.job_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.job_favorites FOR DELETE USING (auth.uid() = user_id);
