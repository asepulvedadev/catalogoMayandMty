/*
  # Storage bucket and policies for product images
  
  1. Changes
    - Creates products storage bucket if it doesn't exist
    - Creates policies for image upload, update, and delete operations
    - Adds checks to prevent duplicate policy creation
  
  2. Security
    - Only authenticated users can upload images
    - Users can only update/delete their own images
    - Restricts file types to jpg, jpeg, png, and webp
*/

-- Create products storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Create upload policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
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
  END IF;
END $$;

-- Create update policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can update their own images'
  ) THEN
    CREATE POLICY "Authenticated users can update their own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner)
    WITH CHECK (bucket_id = 'products');
  END IF;
END $$;

-- Create delete policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can delete their own images'
  ) THEN
    CREATE POLICY "Authenticated users can delete their own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (auth.uid() = owner AND bucket_id = 'products');
  END IF;
END $$;