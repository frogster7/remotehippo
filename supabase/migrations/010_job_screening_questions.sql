-- Add employer-defined screening questions for job applications.
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS screening_questions jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS screening_answers jsonb NOT NULL DEFAULT '[]'::jsonb;
