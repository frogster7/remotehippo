-- Notifications for job alerts (saved-search matches)
-- Run after 009_saved_searches.sql

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'job_alert',
  payload jsonb NOT NULL DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);

COMMENT ON TABLE public.notifications IS 'User notifications (e.g. new job matching a saved search)';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Inserts are done only by the notify function (SECURITY DEFINER)
-- No INSERT policy for authenticated users

-- Helper: true if job row j matches saved search filters (jsonb).
CREATE OR REPLACE FUNCTION public.job_matches_saved_search_filters(
  j record,
  f jsonb
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- work_types
  IF f->'work_types' IS NOT NULL AND jsonb_array_length(COALESCE(f->'work_types', '[]'::jsonb)) > 0 THEN
    IF NOT (f->'work_types' @> to_jsonb(j.work_type::text)) THEN
      RETURN false;
    END IF;
  END IF;
  -- job_types / job_type
  IF f->'job_types' IS NOT NULL AND jsonb_array_length(COALESCE(f->'job_types', '[]'::jsonb)) > 0 THEN
    IF NOT (f->'job_types' @> to_jsonb(j.job_type::text)) THEN
      RETURN false;
    END IF;
  ELSIF f->>'job_type' IS NOT NULL AND trim(COALESCE(f->>'job_type', '')) <> '' THEN
    IF f->>'job_type' <> j.job_type::text THEN
      RETURN false;
    END IF;
  END IF;
  -- roles
  IF f->'roles' IS NOT NULL AND jsonb_array_length(COALESCE(f->'roles', '[]'::jsonb)) > 0 THEN
    IF NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(f->'roles') AS r
      WHERE j.role ILIKE '%' || r || '%'
    ) THEN
      RETURN false;
    END IF;
  END IF;
  -- tech
  IF f->'tech' IS NOT NULL AND jsonb_array_length(COALESCE(f->'tech', '[]'::jsonb)) > 0 THEN
    IF NOT (j.tech_stack && ARRAY(SELECT jsonb_array_elements_text(f->'tech'))) THEN
      RETURN false;
    END IF;
  END IF;
  -- q
  IF f->>'q' IS NOT NULL AND trim(COALESCE(f->>'q', '')) <> '' THEN
    IF j.title ILIKE '%' || trim(f->>'q') || '%' THEN
      NULL;
    ELSIF j.description ILIKE '%' || trim(f->>'q') || '%' THEN
      NULL;
    ELSIF j.role ILIKE '%' || trim(f->>'q') || '%' THEN
      NULL;
    ELSE
      RETURN false;
    END IF;
  END IF;
  -- location
  IF f->>'location' IS NOT NULL AND trim(COALESCE(f->>'location', '')) <> '' THEN
    IF trim(lower(f->>'location')) = 'remote' THEN
      IF NOT (j.location ILIKE '%Remote%' OR j.work_type = 'remote') THEN
        RETURN false;
      END IF;
    ELSIF j.location IS NULL OR j.location NOT ILIKE '%' || trim(f->>'location') || '%' THEN
      RETURN false;
    END IF;
  END IF;
  RETURN true;
END;
$$;

-- Notify all users whose saved search matches the job. Called after job create/activate.
CREATE OR REPLACE FUNCTION public.notify_job_alert(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  j record;
  ss record;
  payload_json jsonb;
  user_ids_done uuid[] := '{}';
BEGIN
  SELECT id, title, slug, description, role, work_type, job_type, tech_stack, location
  INTO j
  FROM jobs
  WHERE id = p_job_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR ss IN
    SELECT user_id, name, filters
    FROM saved_searches
  LOOP
    IF ss.user_id = ANY(user_ids_done) THEN
      CONTINUE;
    END IF;
    IF NOT public.job_matches_saved_search_filters(j, ss.filters) THEN
      CONTINUE;
    END IF;

    payload_json := jsonb_build_object(
      'job_id', p_job_id,
      'job_slug', j.slug,
      'job_title', j.title,
      'saved_search_name', ss.name
    );
    INSERT INTO notifications (user_id, type, payload)
    VALUES (ss.user_id, 'job_alert', payload_json);
    user_ids_done := array_append(user_ids_done, ss.user_id);
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.notify_job_alert(uuid) IS 'Create job_alert notifications for users whose saved search matches the job';
