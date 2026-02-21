-- Add is_default to user_cvs and user_cover_letters
-- Only one CV and one cover letter can be default per user

ALTER TABLE public.user_cvs ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_cover_letters ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

CREATE POLICY "Users can update own CVs"
  ON public.user_cvs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cover letters"
  ON public.user_cover_letters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Set first CV/cover letter as default for existing users
WITH first_cvs AS (
  SELECT DISTINCT ON (user_id) id FROM public.user_cvs ORDER BY user_id, created_at ASC
)
UPDATE public.user_cvs SET is_default = true WHERE id IN (SELECT id FROM first_cvs);

WITH first_cls AS (
  SELECT DISTINCT ON (user_id) id FROM public.user_cover_letters ORDER BY user_id, created_at ASC
)
UPDATE public.user_cover_letters SET is_default = true WHERE id IN (SELECT id FROM first_cls);

COMMENT ON COLUMN public.user_cvs.is_default IS 'If true, this CV is used by default when applying';
COMMENT ON COLUMN public.user_cover_letters.is_default IS 'If true, this cover letter is used by default when applying';
