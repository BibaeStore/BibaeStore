-- 1. Enable Storage
-- Make sure the storage extension is enabled (usually is by default)

-- 2. Create the 'categories' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- 3. DROP existing policies to avoid conflicts when running this script
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
-- Also drop policies that might have different names but same purpose
DROP POLICY IF EXISTS "Give me access" ON storage.objects; -- Common debugging policy name

-- 4. Create Policies

-- Allow PUBLIC read access (so anyone can see the category images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'categories' );

-- Allow AUTHENTICATED users to INSERT (upload) files
-- If you are testing without logging in, change 'authenticated' to 'anon' temporarily
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'categories' );

-- Allow AUTHENTICATED users to UPDATE files
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'categories' );

-- Allow AUTHENTICATED users to DELETE files
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'categories' );
