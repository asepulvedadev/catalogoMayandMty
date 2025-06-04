/*
  # Fix RLS policies for products table

  1. Security Changes
    - Enable RLS on products table
    - Add policies for CRUD operations:
      - Everyone can read products
      - Authenticated users can create products
      - Authenticated users can update products
      - Authenticated users can delete products

  2. Notes
    - All authenticated users will have full access to manage products
    - Public users can only read products
*/

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;
DROP POLICY IF EXISTS "Users can insert products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;

-- Create new policies
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update products"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can delete products"
ON products FOR DELETE
TO authenticated
USING (true);