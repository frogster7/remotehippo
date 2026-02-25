-- Create 10 mock companies (auth users + employer profiles + 1 active job each).
-- Run in Supabase Dashboard > SQL Editor.
-- Re-runnable: does not duplicate users/profiles/jobs for the same seeded company index.

DO $$
DECLARE
  i int;
  uid uuid;
  email_value text;
  company_names text[] := ARRAY[
    'Northbyte Labs',
    'PixelForge Studio',
    'Cloudmesh Systems',
    'Asterix Data',
    'NovaStack Technologies',
    'Greenloop Digital',
    'Bluepeak Software',
    'Quantum Dock',
    'Signalriver Tech',
    'Ironclad Apps'
  ];
  company_locations text[] := ARRAY[
    'Berlin',
    'Remote (EU)',
    'Amsterdam',
    'London',
    'Warsaw',
    'Remote',
    'Stockholm',
    'Prague',
    'Dublin',
    'Lisbon'
  ];
BEGIN
  FOR i IN 1..10 LOOP
    email_value := format('mock-company-%s@example.com', i);

    -- 1) Ensure auth user exists (needed by profiles FK to auth.users.id)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    SELECT
      '00000000-0000-0000-0000-000000000000'::uuid,
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      email_value,
      crypt('MockPassword123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'role', 'employer',
        'company_name', company_names[i]
      ),
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1
      FROM auth.users u
      WHERE lower(u.email) = lower(email_value)
    );

    SELECT u.id
    INTO uid
    FROM auth.users u
    WHERE lower(u.email) = lower(email_value)
    LIMIT 1;

    IF uid IS NULL THEN
      RAISE EXCEPTION 'Could not resolve auth user for %', email_value;
    END IF;

    -- 2) Upsert employer profile
    INSERT INTO public.profiles (
      id,
      role,
      full_name,
      company_name,
      company_website,
      company_location
    )
    VALUES (
      uid,
      'employer'::public.profile_role,
      company_names[i] || ' HR',
      company_names[i],
      format('https://www.%s.example', replace(lower(company_names[i]), ' ', '-')),
      company_locations[i]
    )
    ON CONFLICT (id) DO UPDATE
    SET
      role = 'employer'::public.profile_role,
      company_name = EXCLUDED.company_name,
      company_website = EXCLUDED.company_website,
      company_location = EXCLUDED.company_location;

    -- 3) Ensure at least one active job per seeded company
    IF NOT EXISTS (
      SELECT 1
      FROM public.jobs j
      WHERE j.employer_id = uid
        AND j.slug = format('mock-company-%s-platform-engineer', i)
    ) THEN
      INSERT INTO public.jobs (
        employer_id,
        title,
        slug,
        description,
        role,
        work_type,
        job_type,
        tech_stack,
        salary_min,
        salary_max,
        location,
        is_active,
        application_email,
        summary,
        responsibilities,
        requirements,
        what_we_offer,
        screening_questions
      ) VALUES (
        uid,
        'Platform Engineer',
        format('mock-company-%s-platform-engineer', i),
        'This is a mock job generated for testing company listings and branding.',
        'Platform',
        CASE WHEN i % 2 = 0 THEN 'hybrid'::public.work_type ELSE 'remote'::public.work_type END,
        CASE WHEN i % 3 = 0 THEN 'contract'::public.job_type ELSE 'full-time'::public.job_type END,
        ARRAY['TypeScript', 'PostgreSQL', 'Docker'],
        70000 + (i * 1500),
        100000 + (i * 2000),
        company_locations[i],
        true,
        'hr@example.com',
        'Join a collaborative engineering team and help improve platform reliability.',
        '- Build and maintain core services
- Improve performance and observability
- Collaborate across product and engineering',
        '- 3+ years of backend or platform experience
- Experience with cloud infrastructure
- Strong communication skills',
        '- Flexible hours
- Learning budget
- Remote-friendly culture',
        '[]'::jsonb
      );
    END IF;
  END LOOP;

  RAISE NOTICE 'Seeded 10 mock companies with employer profiles and jobs.';
END $$;
