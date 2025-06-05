/*
  # Update Quotes RLS Policies

  1. Changes
    - Drop existing RLS policies for quotes table
    - Create new, more permissive policies for authenticated users
    - Ensure proper access control based on user ownership

  2. Security
    - Maintain RLS enabled
    - Add policies for all CRUD operations
    - Ensure users can only access their own quotes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update their own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quotes;

-- Create new policies
CREATE POLICY "Enable read access for own quotes"
ON quotes FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Enable insert access for own quotes"
ON quotes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for own quotes"
ON quotes FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable delete access for own quotes"
ON quotes FOR DELETE
TO authenticated
USING (auth.uid() = created_by);