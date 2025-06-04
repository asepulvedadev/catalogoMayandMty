/*
  # Storage bucket setup

  1. Changes
    - Creates products storage bucket if it doesn't exist
    
  Note: Policies are already created in previous migrations
*/

-- Create products storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;