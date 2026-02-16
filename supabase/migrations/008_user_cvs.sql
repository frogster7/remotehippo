-- User CVs: up to 3 per user (replaces single cv_file_url on profiles)
-- Run after 006, 007.

-- -----------------------------------------------------------------------------
-- 1. user_cvs table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_cvs_user_id ON public.user_cvs(user_id);

COMMENT ON TABLE public.user_cvs IS 'Job seeker CVs (up to 3 per user). Replaces profiles.cv_file_url.';

-- -----------------------------------------------------------------------------
-- 2. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CVs"
  ON public.user_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs"
  ON public.user_cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own CVs"
  ON public.user_cvs FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. Backfill from profiles.cv_file_url
-- -----------------------------------------------------------------------------
INSERT INTO public.user_cvs (user_id, storage_path)
SELECT id, cv_file_url
FROM public.profiles
WHERE cv_file_url IS NOT NULL AND cv_file_url != '';

-- -----------------------------------------------------------------------------
-- 4. Drop legacy column
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles DROP COLUMN IF EXISTS cv_file_url;
