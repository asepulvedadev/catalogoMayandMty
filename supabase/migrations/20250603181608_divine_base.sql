/*
  # Add storage bucket for product images

  1. New Storage Bucket
    - Create a new storage bucket named 'products' for storing product images
    - Enable public access for the bucket
    - Set up security policies for authenticated users

  2. Security
    - Enable public access for viewing images
    - Allow authenticated users to upload and delete images
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');