/*
  # Add support for multiple product images

  1. Changes
    - Add images array to products table to store multiple image URLs
    - Maintain backward compatibility with existing image_url field
    - Add function to migrate existing image_url data to images array

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE products 
ADD COLUMN images text[] DEFAULT '{}';

-- Migrate existing image_url data to images array
UPDATE products 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL 
AND (images IS NULL OR array_length(images, 1) IS NULL);