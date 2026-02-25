-- Seed 30 mock job listings for testing. Run in Supabase Dashboard > SQL Editor.
-- Requires at least one employer: ensure you have a user with role = 'employer' in profiles.
-- To remove later: DELETE FROM jobs WHERE slug LIKE 'mock-%';

DO $$
DECLARE
  emp_id uuid;
  i int;
  titles text[] := ARRAY[
    'Senior Frontend Developer',
    'Backend Engineer (Node.js)',
    'Full-Stack Developer',
    'DevOps Engineer',
    'React Developer',
    'Python Developer',
    'Data Engineer',
    'Mobile Developer (React Native)',
    'QA Engineer',
    'Product Designer',
    'Technical Lead',
    'Junior Frontend Developer',
    'Cloud Engineer (AWS)',
    'Machine Learning Engineer',
    'Security Engineer',
    'UX Engineer',
    'Site Reliability Engineer',
    'iOS Developer',
    'Android Developer',
    'Rust Developer',
    'Go Developer',
    'PHP Developer',
    'Ruby on Rails Developer',
    'Vue.js Developer',
    'Angular Developer',
    'Data Scientist',
    'Platform Engineer',
    'Frontend Architect',
    'Backend Architect',
    'Engineering Manager'
  ];
  roles text[] := ARRAY['Frontend', 'Backend', 'Full-stack', 'DevOps', 'Data', 'Mobile', 'QA', 'Design', 'Security'];
  work_types text[] := ARRAY['remote', 'hybrid'];
  job_types text[] := ARRAY['full-time', 'contract'];
  tech_stacks text[][] := ARRAY[
    ARRAY['React', 'TypeScript', 'Node.js'],
    ARRAY['Python', 'Django', 'PostgreSQL'],
    ARRAY['JavaScript', 'Vue.js', 'CSS'],
    ARRAY['Go', 'Kubernetes', 'Docker'],
    ARRAY['Java', 'Spring', 'Kafka'],
    ARRAY['C#', '.NET', 'SQL Server'],
    ARRAY['Rust', 'PostgreSQL', 'Docker'],
    ARRAY['React', 'GraphQL', 'AWS'],
    ARRAY['Node.js', 'MongoDB', 'Redis'],
    ARRAY['TypeScript', 'React', 'Tailwind']
  ];
  locations text[] := ARRAY['Remote', 'Berlin', 'London', 'Amsterdam', 'Remote (EU)', 'New York', 'Warsaw', null];
  t text; r text; wt text; jt text; loc text; tech text[]; sal_min int; sal_max int;
BEGIN
  SELECT id INTO emp_id FROM public.profiles WHERE role = 'employer' LIMIT 1;
  IF emp_id IS NULL THEN
    RAISE EXCEPTION 'No employer profile found. Create an employer account first (register as company), then run this seed.';
  END IF;

  FOR i IN 1..30 LOOP
    t := titles[1 + ((i - 1) % array_length(titles, 1))];
    r := roles[1 + ((i - 1) % array_length(roles, 1))];
    wt := work_types[1 + ((i - 1) % 2)];
    jt := job_types[1 + ((i - 1) % 2)];
    loc := locations[1 + ((i - 1) % array_length(locations, 1))];
    tech := tech_stacks[1 + ((i - 1) % array_length(tech_stacks, 1))];
    sal_min := 60000 + (i * 2000);
    sal_max := 90000 + (i * 3000);

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
      emp_id,
      t,
      'mock-' || i || '-' || substr(md5(random()::text), 1, 8),
      'We are looking for a ' || t || ' to join our team. This is a mock listing for testing. You will work on exciting projects and collaborate with a distributed team.',
      r,
      wt::public.work_type,
      jt::public.job_type,
      tech,
      sal_min,
      sal_max,
      loc,
      true,
      'hr@example.com',
      'Join our engineering team and help us build great products. This is a seed listing for testing the job board.',
      '• Design and implement new features\n• Code review and mentoring\n• Collaborate with product and design',
      '• 3+ years experience\n• Strong communication skills\n• Experience with our stack',
      '• Competitive salary\n• Remote work\n• Learning budget',
      '[]'::jsonb
    );
  END LOOP;

  RAISE NOTICE 'Inserted 30 mock jobs for employer %', emp_id;
END $$;
