-- Add optional application contact per job (apply URL or email)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS application_email text,
  ADD COLUMN IF NOT EXISTS application_url text;

COMMENT ON COLUMN public.jobs.application_email IS 'Email address for applications (mailto link)';
COMMENT ON COLUMN public.jobs.application_url IS 'URL for applications (e.g. careers page or ATS)';
