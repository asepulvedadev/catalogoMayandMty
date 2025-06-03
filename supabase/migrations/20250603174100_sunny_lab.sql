/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `material` (text)
      - `width` (numeric)
      - `height` (numeric)
      - `unit_price` (numeric)
      - `bulk_price` (numeric)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to perform CRUD operations
    - Allow public read access
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  material text NOT NULL CHECK (material IN ('mdf', 'acrilico', 'pvc', 'coroplax', 'acetato', 'carton', 'tela')),
  width numeric NOT NULL,
  height numeric NOT NULL,
  unit_price numeric NOT NULL,
  bulk_price numeric NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to perform all operations
CREATE POLICY "Users can insert products" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products" ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete products" ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();