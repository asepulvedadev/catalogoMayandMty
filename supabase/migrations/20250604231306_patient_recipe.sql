/*
  # Add RLS policies for customers table

  1. Changes
    - Add RLS policy to allow authenticated users to insert customers
    - Ensure created_by is automatically set to the authenticated user's ID

  2. Security
    - Only allows users to insert customers where they are set as the creator
    - Maintains existing policies for other operations
*/

-- Enable RLS if not already enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Add policy for inserting customers
CREATE POLICY "Users can insert customers"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

-- Add trigger to automatically set created_by
CREATE OR REPLACE FUNCTION set_customer_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_customer_created_by_trigger
  BEFORE INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_created_by();