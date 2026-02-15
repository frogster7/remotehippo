-- Structured sections for job detail (Summary, Responsibilities, Requirements, etc.)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS responsibilities text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS what_we_offer text,
  ADD COLUMN IF NOT EXISTS good_to_have text,
  ADD COLUMN IF NOT EXISTS benefits text;

COMMENT ON COLUMN public.jobs.summary IS 'Short offer summary (plain text or newline-separated bullets)';
COMMENT ON COLUMN public.jobs.responsibilities IS 'Key responsibilities (plain text or newline-separated bullets)';
COMMENT ON COLUMN public.jobs.requirements IS 'Requirements (plain text or newline-separated bullets)';
COMMENT ON COLUMN public.jobs.what_we_offer IS 'What we offer (plain text or newline-separated bullets)';
COMMENT ON COLUMN public.jobs.good_to_have IS 'Nice to have (optional, plain text or newline-separated bullets)';
COMMENT ON COLUMN public.jobs.benefits IS 'Benefits (optional, plain text or newline-separated bullets)';
