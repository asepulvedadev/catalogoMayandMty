/*
  # Fix RLS policies for customers table

  1. Changes
    - Add RLS policies for customers table to allow authenticated users to:
      - Create customers
      - Read customers
      - Update customers
      - Delete customers
    - Policies are scoped to the authenticated user's created_by field

  2. Security
    - Enable RLS on customers table
    - Add policies for CRUD operations
*/

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create customers" ON customers;
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

-- Create new policies
CREATE POLICY "Users can create customers"
ON customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own customers"
ON customers FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own customers"
ON customers FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own customers"
ON customers FOR DELETE
TO authenticated
USING (auth.uid() = created_by);