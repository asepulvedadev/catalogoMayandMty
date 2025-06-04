/*
  # Storage policies for product images

  1. Changes
    - Creates products storage bucket if it doesn't exist
    - Ensures public access to view product images
    - Allows authenticated users to upload images (jpg, jpeg, png, webp only)
    - Allows users to update and delete their own images
    
  2. Security
    - Public read access for all product images
    - Authenticated users can upload images
    - Users can only modify their own images
*/

-- Create products storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own images" ON storage.objects;

-- Allow public access to product images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'products' AND
    (LOWER(storage.extension(name)) = 'jpg' OR
     LOWER(storage.extension(name)) = 'jpeg' OR
     LOWER(storage.extension(name)) = 'png' OR
     LOWER(storage.extension(name)) = 'webp')
);

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'products');