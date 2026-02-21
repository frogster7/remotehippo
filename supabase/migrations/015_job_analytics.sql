-- Job analytics: views and apply clicks per job
-- Used by employer dashboard for stats (views, apply clicks, applications)

-- -----------------------------------------------------------------------------
-- 1. job_views – one row per job detail page view
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON public.job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_job_views_viewed_at ON public.job_views(viewed_at DESC);

COMMENT ON TABLE public.job_views IS 'Job detail page view events for employer stats';

-- -----------------------------------------------------------------------------
-- 2. job_apply_clicks – one row per apply button/landing event
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_apply_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_apply_clicks_job_id ON public.job_apply_clicks(job_id);
CREATE INDEX IF NOT EXISTS idx_job_apply_clicks_clicked_at ON public.job_apply_clicks(clicked_at DESC);

COMMENT ON TABLE public.job_apply_clicks IS 'Apply button/landing events for employer stats';

-- -----------------------------------------------------------------------------
-- 3. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_apply_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert – analytics are append-only, not sensitive
CREATE POLICY "Allow insert job_views"
  ON public.job_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow insert job_apply_clicks"
  ON public.job_apply_clicks FOR INSERT
  WITH CHECK (true);

-- Employers can SELECT only for their own jobs
CREATE POLICY "Employers can view job_views for own jobs"
  ON public.job_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_views.job_id
        AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view job_apply_clicks for own jobs"
  ON public.job_apply_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_apply_clicks.job_id
        AND jobs.employer_id = auth.uid()
    )
  );
