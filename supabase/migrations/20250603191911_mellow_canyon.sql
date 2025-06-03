/*
  # Migrate image_url data to images array

  1. Changes
    - Update products table to migrate image_url data to images array
    - Only update records where image_url exists and images array is empty

  2. Notes
    - Non-destructive migration that preserves existing data
    - Only affects records that haven't been migrated yet
*/

-- Migrate existing image_url data to images array only for records that haven't been migrated
UPDATE products 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL 
AND (images = '{}' OR images IS NULL);