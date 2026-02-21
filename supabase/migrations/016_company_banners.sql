-- Company banners: up to 3 per employer, displayed in job listings
-- Uses company-logos bucket, path: {employer_id}/banners/{filename}

CREATE TABLE IF NOT EXISTS public.company_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_banners_employer_id ON public.company_banners(employer_id);

COMMENT ON TABLE public.company_banners IS 'Banner images for employer job listings (max 3 per employer)';

ALTER TABLE public.company_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can manage own banners"
  ON public.company_banners FOR ALL
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Anyone can view company banners"
  ON public.company_banners FOR SELECT
  USING (true);
