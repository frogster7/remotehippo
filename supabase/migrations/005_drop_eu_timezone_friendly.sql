-- Remove EU timezone friendly from project
ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS eu_timezone_friendly;
