-- Company profile extensions: benefits, experiences (user reviews), hiring process, gallery
-- Run after 016. See BUILD_LOG.md.

-- -----------------------------------------------------------------------------
-- 1. Enum for experience moderation status
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.experience_status AS ENUM ('pending', 'approved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Company benefits (employer-defined)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_benefits_employer_id ON public.company_benefits(employer_id);
COMMENT ON TABLE public.company_benefits IS 'Employer-defined benefits (e.g. Health insurance, Remote work)';

ALTER TABLE public.company_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can manage own benefits"
  ON public.company_benefits FOR ALL
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Anyone can view company benefits"
  ON public.company_benefits FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 3. Company experiences (user-submitted reviews)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  status public.experience_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_experiences_employer_id ON public.company_experiences(employer_id);
CREATE INDEX IF NOT EXISTS idx_company_experiences_status ON public.company_experiences(employer_id, status);
COMMENT ON TABLE public.company_experiences IS 'User-submitted employee experiences/reviews (approved visible to public)';

ALTER TABLE public.company_experiences ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert own experience
CREATE POLICY "Users can insert own experience"
  ON public.company_experiences FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Public can view approved only
CREATE POLICY "Anyone can view approved experiences"
  ON public.company_experiences FOR SELECT
  USING (status = 'approved');

-- Employers can view all (including pending) for their company
CREATE POLICY "Employers can view own company experiences"
  ON public.company_experiences FOR SELECT
  USING (employer_id = auth.uid());

-- Employers can update status (approve) or delete (reject) experiences for their company
CREATE POLICY "Employers can update own company experiences"
  ON public.company_experiences FOR UPDATE
  USING (employer_id = auth.uid());

CREATE POLICY "Employers can delete own company experiences"
  ON public.company_experiences FOR DELETE
  USING (employer_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. Company hiring steps
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_hiring_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  step_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_hiring_steps_employer_id ON public.company_hiring_steps(employer_id);
COMMENT ON TABLE public.company_hiring_steps IS 'Employer-defined hiring process steps';

ALTER TABLE public.company_hiring_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can manage own hiring steps"
  ON public.company_hiring_steps FOR ALL
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Anyone can view company hiring steps"
  ON public.company_hiring_steps FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- 5. Company gallery
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_gallery_employer_id ON public.company_gallery(employer_id);
COMMENT ON TABLE public.company_gallery IS 'Company gallery images (uses company-logos bucket, path: {employer_id}/gallery/)';

ALTER TABLE public.company_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can manage own gallery"
  ON public.company_gallery FOR ALL
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Anyone can view company gallery"
  ON public.company_gallery FOR SELECT
  USING (true);
