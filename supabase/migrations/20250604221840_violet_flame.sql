/*
  # Add Customers and Quotes Tables

  1. New Tables
    - customers
      - Basic customer information
      - Contact details
      - Address information
    - quotes
      - Quote details
      - Customer reference
      - Products included
      - Pricing information
    
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  tax_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  total_amount numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0.16,
  tax_amount numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL DEFAULT 0,
  notes text,
  valid_until date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create quote items table
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  notes text
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Quotes policies
CREATE POLICY "Users can view their own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Quote items policies
CREATE POLICY "Users can view quote items for their quotes"
  ON quote_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.created_by = auth.uid()
  ));

CREATE POLICY "Users can create quote items for their quotes"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.created_by = auth.uid()
  ));

CREATE POLICY "Users can update quote items for their quotes"
  ON quote_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.created_by = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete quote items for their quotes"
  ON quote_items FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quotes
    WHERE quotes.id = quote_items.quote_id
    AND quotes.created_by = auth.uid()
  ));

-- Create function to update quote totals
CREATE OR REPLACE FUNCTION update_quote_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new totals
  WITH totals AS (
    SELECT 
      COALESCE(SUM(total_price), 0) as subtotal
    FROM quote_items
    WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
  )
  UPDATE quotes
  SET 
    subtotal = totals.subtotal,
    tax_amount = totals.subtotal * tax_rate,
    total_amount = totals.subtotal + (totals.subtotal * tax_rate),
    updated_at = now()
  FROM totals
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update quote totals
CREATE TRIGGER update_quote_totals_insert_update
  AFTER INSERT OR UPDATE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_totals();

CREATE TRIGGER update_quote_totals_delete
  AFTER DELETE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_totals();

-- Create function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quote_number := 'COT-' || to_char(NEW.created_at, 'YYYYMMDD') || '-' || 
                      LPAD(COALESCE(
                        (SELECT COUNT(*) + 1
                         FROM quotes
                         WHERE DATE_TRUNC('day', created_at) = DATE_TRUNC('day', NEW.created_at))::text,
                        '1'
                      ), 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quote number generation
CREATE TRIGGER generate_quote_number_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION generate_quote_number();

-- Create indexes
CREATE INDEX idx_customers_created_by ON customers(created_by);
CREATE INDEX idx_quotes_created_by ON quotes(created_by);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product_id ON quote_items(product_id);