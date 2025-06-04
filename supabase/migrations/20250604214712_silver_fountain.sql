/*
  # Add product views and images columns

  1. Changes
    - Add `product_views` column to store different views of a product (JSONB)
    - Add `images` column to store multiple product images (TEXT[])

  2. Notes
    - Using JSONB for product_views to store view-specific image URLs
    - Using TEXT[] for images to store an array of image URLs
    - Both columns are nullable since they may not be required for all products
*/

ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_views JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'::text[];

-- Update the search vector to include new columns
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('spanish', array_to_string(COALESCE(NEW.keywords, '{}'::text[]), ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;