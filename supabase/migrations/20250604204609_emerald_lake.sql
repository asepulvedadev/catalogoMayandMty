/*
  # Storage configuration for product images

  1. Changes
    - Create products storage bucket
    - Configure storage policies for public access and authenticated users

  2. Security
    - Enable public read access to product images
    - Restrict upload/update/delete to authenticated users
    - Enforce file type restrictions for uploads
*/

-- Create products storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

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