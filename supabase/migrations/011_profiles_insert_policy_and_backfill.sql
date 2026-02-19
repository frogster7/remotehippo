-- Ensure every auth user has a corresponding profiles row and can self-create it.

-- Backfill missing profiles for existing auth users.
INSERT INTO public.profiles (id, role, full_name)
SELECT
  u.id,
  COALESCE((u.raw_user_meta_data->>'role')::public.profile_role, 'job_seeker'),
  COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to insert their own profile row when missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
