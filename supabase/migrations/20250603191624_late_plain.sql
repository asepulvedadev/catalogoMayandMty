/*
  # Add support for multiple images per product

  1. Changes
    - Add new `images` column to store multiple image URLs per product
    - Migrate existing single image_url data to the new images array
    - Keep image_url for backwards compatibility

  2. Data Migration
    - Existing image_url values are copied to the images array
    - Only migrates non-null image_url values
    - Only updates products where images is null or empty
*/

ALTER TABLE products 
ADD COLUMN images text[] DEFAULT '{}';

-- Migrate existing image_url data to images array
UPDATE products 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL 
AND (images IS NULL OR array_length(images, 1) IS NULL);