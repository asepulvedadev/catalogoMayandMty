/*
  # Add categories and keywords to products

  1. Changes
    - Add categories enum type
    - Add keywords array column to products table
    - Add category column to products table
    - Update existing products with default categories

  2. Security
    - Maintain existing RLS policies
*/

-- Create categories enum
CREATE TYPE product_category AS ENUM (
  'office_supplies',
  'kitchen_items',
  'living_hinges',
  'houses_furniture',
  'displays',
  'geometric_shapes',
  'lamps_clocks',
  'letters_numbers',
  'mandalas_dreamcatchers',
  'maps',
  'masks',
  'nature',
  'christmas',
  'easter',
  'frames',
  'shelves',
  'puzzles',
  'transportation'
);

-- Add new columns to products table
ALTER TABLE products 
  ADD COLUMN category product_category NOT NULL DEFAULT 'office_supplies',
  ADD COLUMN keywords text[] DEFAULT '{}';

-- Update existing products with appropriate categories
UPDATE products 
SET category = 'kitchen_items',
    keywords = ARRAY['café', 'bebidas', 'cocina', 'accesorios']
WHERE name LIKE '%Prensa%' OR name LIKE '%Cafetero%' OR name LIKE '%Taza%';

-- Add index for keywords search
CREATE INDEX products_keywords_idx ON products USING GIN (keywords);

COMMENT ON COLUMN products.category IS 'Product category';
COMMENT ON COLUMN products.keywords IS 'Search keywords for the product';