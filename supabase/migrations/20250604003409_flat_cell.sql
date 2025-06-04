/*
  # Search Optimization Migration

  1. Changes
    - Enable unaccent extension for accent-insensitive search
    - Add search_vector column to products table
    - Create trigger to maintain search vector
    - Add indexes for efficient searching
    - Create search function with filtering and sorting

  2. Security
    - No changes to RLS policies
*/

-- Enable the unaccent extension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add search vector column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.description, ''))), 'B') ||
    setweight(to_tsvector('spanish', unaccent(array_to_string(coalesce(NEW.keywords, ARRAY[]::text[]), ' '))), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain search vector
DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_vector_update();

-- Update existing rows
UPDATE products SET search_vector = 
  setweight(to_tsvector('spanish', unaccent(coalesce(name, ''))), 'A') ||
  setweight(to_tsvector('spanish', unaccent(coalesce(description, ''))), 'B') ||
  setweight(to_tsvector('spanish', unaccent(array_to_string(coalesce(keywords, ARRAY[]::text[]), ' '))), 'C');

-- Create GIN index for full text search
CREATE INDEX IF NOT EXISTS products_search_vector_idx ON products USING GIN(search_vector);

-- Create composite index for common filters
CREATE INDEX IF NOT EXISTS products_category_material_idx ON products(category, material);

-- Create index for price range queries
CREATE INDEX IF NOT EXISTS products_unit_price_idx ON products(unit_price);
CREATE INDEX IF NOT EXISTS products_bulk_price_idx ON products(bulk_price);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_products(
  search_query text,
  category_filter product_category DEFAULT NULL,
  material_filter text DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  sort_by text DEFAULT 'relevance',
  sort_direction text DEFAULT 'desc',
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
) RETURNS TABLE (
  id uuid,
  name text,
  description text,
  material text,
  width numeric,
  height numeric,
  unit_price numeric,
  bulk_price numeric,
  image_url text,
  category product_category,
  keywords text[],
  images text[],
  similarity real
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH search_results AS (
    SELECT 
      p.*,
      ts_rank(p.search_vector, to_tsquery('spanish', unaccent(regexp_replace(search_query, '\s+', ':* & ', 'g') || ':*'))) as similarity
    FROM products p
    WHERE 
      (search_query IS NULL OR p.search_vector @@ to_tsquery('spanish', unaccent(regexp_replace(search_query, '\s+', ':* & ', 'g') || ':*')))
      AND (category_filter IS NULL OR p.category = category_filter)
      AND (material_filter IS NULL OR p.material = material_filter)
      AND (min_price IS NULL OR p.unit_price >= min_price)
      AND (max_price IS NULL OR p.unit_price <= max_price)
  )
  SELECT 
    sr.id,
    sr.name,
    sr.description,
    sr.material,
    sr.width,
    sr.height,
    sr.unit_price,
    sr.bulk_price,
    sr.image_url,
    sr.category,
    sr.keywords,
    sr.images,
    sr.similarity
  FROM search_results sr
  ORDER BY
    CASE 
      WHEN sort_by = 'relevance' AND sort_direction = 'desc' THEN sr.similarity END DESC,
    CASE 
      WHEN sort_by = 'relevance' AND sort_direction = 'asc' THEN sr.similarity END ASC,
    CASE 
      WHEN sort_by = 'price' AND sort_direction = 'desc' THEN sr.unit_price END DESC,
    CASE 
      WHEN sort_by = 'price' AND sort_direction = 'asc' THEN sr.unit_price END ASC,
    CASE 
      WHEN sort_by = 'name' AND sort_direction = 'desc' THEN sr.name END DESC,
    CASE 
      WHEN sort_by = 'name' AND sort_direction = 'asc' THEN sr.name END ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;