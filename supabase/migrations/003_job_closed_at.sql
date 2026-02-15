-- Optional: mark a job as "position filled" without deleting (closed_at set = listing closed)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

COMMENT ON COLUMN public.jobs.closed_at IS 'When set, position is filled; listing stays visible but Apply is hidden.';
