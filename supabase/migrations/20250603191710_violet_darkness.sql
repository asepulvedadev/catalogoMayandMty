/*
  # Update products table images

  1. Changes
    - Migrate existing single image_url data to images array if not already migrated
  
  2. Notes
    - Only updates records where image_url exists and images array is empty
    - Preserves existing data in images array
*/

-- Migrate existing image_url data to images array only for records that haven't been migrated
UPDATE products 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL 
AND (images = '{}' OR images IS NULL);