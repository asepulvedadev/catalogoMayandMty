/*
  # Fix RLS policies for quotes table

  1. Changes
    - Add missing RLS policies for quotes table
    - Ensure users can only access their own quotes
    - Enable RLS on quotes table

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Restrict access to authenticated users
*/

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Users can read their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete their own quotes" ON quotes;

-- Create new policies
CREATE POLICY "Users can create quotes"
ON quotes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read their own quotes"
ON quotes
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own quotes"
ON quotes
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quotes"
ON quotes
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);