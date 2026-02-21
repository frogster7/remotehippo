-- User cover letters: up to 5 per user (saved templates, reusable for applications)
-- Run after 008. Reuses user-cvs storage bucket with path prefix cover-letters/

CREATE TABLE IF NOT EXISTS public.user_cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_cover_letters_user_id ON public.user_cover_letters(user_id);

COMMENT ON TABLE public.user_cover_letters IS 'Job seeker cover letters (up to 5 per user). Stored in user-cvs bucket.';

ALTER TABLE public.user_cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cover letters"
  ON public.user_cover_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cover letters"
  ON public.user_cover_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cover letters"
  ON public.user_cover_letters FOR DELETE
  USING (auth.uid() = user_id);
