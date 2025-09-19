-- Change provenance from foreign key to text field in products table
-- This script removes the provenance_id foreign key and adds a simple provenance text field

-- First, drop the foreign key constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_provenance_id_fkey;

-- Drop the index for the foreign key
DROP INDEX IF EXISTS idx_products_provenance_id;

-- Remove the provenance_id column
ALTER TABLE products DROP COLUMN IF EXISTS provenance_id;

-- Add the provenance text field
ALTER TABLE products ADD COLUMN IF NOT EXISTS provenance TEXT;

-- Create index for the text field
CREATE INDEX IF NOT EXISTS idx_products_provenance ON products(provenance);