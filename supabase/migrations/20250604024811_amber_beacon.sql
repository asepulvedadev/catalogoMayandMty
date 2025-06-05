/*
  # Add search functionality to products

  1. Changes
    - Create Spanish text search configuration with unaccent support
    - Add search vector column to products table
    - Create indexes for search and filtering
    - Add search function with filtering and sorting

  2. Indexes
    - GIN index for full text search
    - Composite index for category and material filters
    - Indexes for price range queries

  3. Functions
    - search_products: Main search function with filtering and sorting
*/

DO $$ 
BEGIN
  -- Create Spanish text search configuration if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_ts_config WHERE cfgname = 'spanish_unaccent'
  ) THEN
    CREATE TEXT SEARCH CONFIGURATION spanish_unaccent (COPY = spanish);
    ALTER TEXT SEARCH CONFIGURATION spanish_unaccent
      ALTER MAPPING FOR hword, hword_part, word WITH unaccent, spanish_stem;
  END IF;
END $$;

-- Add search vector column to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('spanish_unaccent', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('spanish_unaccent', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('spanish_unaccent', array_to_string(coalesce(keywords, ARRAY[]::text[]), ' ')), 'C')
) STORED;

-- Create GIN index for full text search
CREATE INDEX IF NOT EXISTS products_search_vector_idx ON products USING GIN(search_vector);

-- Create composite index for common filters
CREATE INDEX IF NOT EXISTS products_category_material_idx ON products(category, material);

-- Create index for price range queries
CREATE INDEX IF NOT EXISTS products_unit_price_idx ON products(unit_price);
CREATE INDEX IF NOT EXISTS products_bulk_price_idx ON products(bulk_price);

-- Add SKU and QR code columns to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sku text UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code text UNIQUE;

-- Create index for SKU lookups
CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);

-- Create index for QR code lookups
CREATE INDEX IF NOT EXISTS products_qr_code_idx ON products(qr_code);

-- Function to generate SKU
CREATE OR REPLACE FUNCTION generate_sku(category product_category) 
RETURNS text AS $$
DECLARE
  prefix text;
  random_part text;
  new_sku text;
  exists boolean;
BEGIN
  -- Get prefix based on category
  prefix := CASE category
    WHEN 'office_supplies' THEN 'OF'
    WHEN 'kitchen_items' THEN 'KT'
    WHEN 'living_hinges' THEN 'LH'
    WHEN 'houses_furniture' THEN 'HF'
    WHEN 'displays' THEN 'DP'
    WHEN 'geometric_shapes' THEN 'GS'
    WHEN 'lamps_clocks' THEN 'LC'
    WHEN 'letters_numbers' THEN 'LN'
    WHEN 'mandalas_dreamcatchers' THEN 'MD'
    WHEN 'maps' THEN 'MP'
    WHEN 'masks' THEN 'MK'
    WHEN 'nature' THEN 'NT'
    WHEN 'christmas' THEN 'CH'
    WHEN 'easter' THEN 'ES'
    WHEN 'frames' THEN 'FR'
    WHEN 'shelves' THEN 'SH'
    WHEN 'puzzles' THEN 'PZ'
    WHEN 'transportation' THEN 'TR'
    ELSE 'PR'
  END;

  -- Generate random part and check for uniqueness
  LOOP
    random_part := upper(substring(md5(random()::text) from 1 for 6));
    new_sku := prefix || '-' || random_part;
    
    SELECT EXISTS(SELECT 1 FROM products WHERE sku = new_sku) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;

  RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- Function to generate QR code
CREATE OR REPLACE FUNCTION generate_qr_code(sku text) 
RETURNS text AS $$
BEGIN
  RETURN 'https://catalogomayand.com/products/' || sku;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate SKU and QR code
CREATE OR REPLACE FUNCTION set_product_codes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL THEN
    NEW.sku := generate_sku(NEW.category);
  END IF;
  
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := generate_qr_code(NEW.sku);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_codes_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_codes();

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
      ts_rank(p.search_vector, to_tsquery('spanish_unaccent', regexp_replace(search_query, '\s+', ':* & ', 'g') || ':*')) as similarity
    FROM products p
    WHERE 
      (
        search_query IS NULL 
        OR p.search_vector @@ to_tsquery('spanish_unaccent', regexp_replace(search_query, '\s+', ':* & ', 'g') || ':*')
        OR EXISTS (
          SELECT 1 
          FROM unnest(p.keywords) keyword 
          WHERE keyword ILIKE '%' || search_query || '%'
        )
      )
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
      WHEN sort_by = 'price' AND sort_direction = 'asc' THEN sr.unit_price
      WHEN sort_by = 'price' AND sort_direction = 'desc' THEN -sr.unit_price
      ELSE -sr.similarity
    END
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;