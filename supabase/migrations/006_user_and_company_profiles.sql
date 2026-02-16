-- Step 1: User & company profile fields + applications table
-- Run after 001, 002, 003, 004, 005. See BUILD_log.md.

-- -----------------------------------------------------------------------------
-- 1. Enum for how companies want to receive applications
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.application_preference AS ENUM ('website', 'email');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2. New columns on profiles (job seekers + employers)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS cv_file_url text,
  ADD COLUMN IF NOT EXISTS company_about text,
  ADD COLUMN IF NOT EXISTS company_location text,
  ADD COLUMN IF NOT EXISTS application_preference public.application_preference;

COMMENT ON COLUMN public.profiles.last_name IS 'Job seeker last name';
COMMENT ON COLUMN public.profiles.phone_number IS 'Job seeker phone number';
COMMENT ON COLUMN public.profiles.cv_file_url IS 'Job seeker CV file URL (Supabase Storage)';
COMMENT ON COLUMN public.profiles.company_about IS 'Company description / about text';
COMMENT ON COLUMN public.profiles.company_location IS 'Company location';
COMMENT ON COLUMN public.profiles.application_preference IS 'Employer: receive applications by email or redirect to website';

-- -----------------------------------------------------------------------------
-- 3. Update trigger: create profile with new fields from signup metadata
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  pref public.application_preference;
BEGIN
  pref := NULL;
  IF NEW.raw_user_meta_data->>'application_preference' = 'website' THEN
    pref := 'website'::public.application_preference;
  ELSIF NEW.raw_user_meta_data->>'application_preference' = 'email' THEN
    pref := 'email'::public.application_preference;
  END IF;

  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    last_name,
    phone_number,
    company_name,
    company_website,
    company_logo_url,
    company_about,
    company_location,
    application_preference
  )
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.profile_role,
      'job_seeker'
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'company_website',
    NEW.raw_user_meta_data->>'company_logo_url',
    NEW.raw_user_meta_data->>'company_about',
    NEW.raw_user_meta_data->>'company_location',
    pref
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 4. Applications table (job applications for email flow + history)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  applicant_name text NOT NULL,
  applicant_last_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text NOT NULL,
  cv_url text NOT NULL,
  cover_letter_text text,
  cover_letter_url text,
  status text NOT NULL DEFAULT 'pending',
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON public.applications(applied_at DESC);

COMMENT ON TABLE public.applications IS 'Job applications (when employer receives by email)';

-- -----------------------------------------------------------------------------
-- 5. RLS for applications
-- -----------------------------------------------------------------------------
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = applicant_id);

-- Authenticated users can insert applications (only as themselves)
CREATE POLICY "Users can insert own application"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- Employers can view applications for their jobs
CREATE POLICY "Employers can view applications for their jobs"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
        AND jobs.employer_id = auth.uid()
    )
  );
