-- Storage buckets for user CVs and company logos
-- Run after 006. Create buckets and RLS so app can upload via client/server.

-- -----------------------------------------------------------------------------
-- 1. Bucket: user-cvs (private – only owner can read; for CV uploads)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-cvs',
  'user-cvs',
  false,
  10485760,  -- 10 MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path convention: {user_id}/{filename} – first path segment must be auth.uid()
CREATE POLICY "Users can upload own CV"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-cvs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own CV"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-cvs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own CV"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-cvs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own CV"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-cvs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- 2. Bucket: company-logos (public – job cards can show logos)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path convention: {user_id}/{filename} – only owner can write
CREATE POLICY "Authenticated can upload company logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view company logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');

CREATE POLICY "Users can update own company logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own company logo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
