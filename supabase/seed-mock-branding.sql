-- Assign mock logos and banners to employers referenced by jobs.
-- Run in Supabase Dashboard > SQL Editor.
-- Safe for testing; re-running will reshuffle assignments.

DO $$
DECLARE
  logo_urls text[] := ARRAY[
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&h=400&q=80'
  ];
  banner_urls text[] := ARRAY[
    'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1400&h=500&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&h=500&q=80'
  ];
  employer_count int;
BEGIN
  SELECT COUNT(*) INTO employer_count
  FROM (
    SELECT DISTINCT employer_id
    FROM public.jobs
  ) t;

  IF employer_count = 0 THEN
    RAISE EXCEPTION 'No jobs found. Seed jobs first, then run this script.';
  END IF;

  -- Shuffle and assign logos to each employer with at least one job.
  WITH target_employers AS (
    SELECT DISTINCT employer_id
    FROM public.jobs
  ),
  shuffled AS (
    SELECT employer_id, row_number() OVER (ORDER BY random()) AS rn
    FROM target_employers
  )
  UPDATE public.profiles p
  SET company_logo_url = logo_urls[((s.rn - 1) % array_length(logo_urls, 1)) + 1]
  FROM shuffled s
  WHERE p.id = s.employer_id;

  -- Replace existing company banners for those employers, then assign one randomized banner each.
  DELETE FROM public.company_banners cb
  USING (
    SELECT DISTINCT employer_id
    FROM public.jobs
  ) te
  WHERE cb.employer_id = te.employer_id;

  WITH target_employers AS (
    SELECT DISTINCT employer_id
    FROM public.jobs
  ),
  shuffled AS (
    SELECT employer_id, row_number() OVER (ORDER BY random()) AS rn
    FROM target_employers
  )
  INSERT INTO public.company_banners (employer_id, url, display_order)
  SELECT
    employer_id,
    banner_urls[((rn - 1) % array_length(banner_urls, 1)) + 1],
    0
  FROM shuffled;

  RAISE NOTICE 'Assigned mock branding for % employer(s).', employer_count;
END $$;
