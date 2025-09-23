-- Migration: Update invoice_items table to replace 'description' with 'imei'
-- This script renames the 'description' column to 'imei' in the invoice_items table

-- First, add the new 'imei' column
ALTER TABLE invoice_items ADD COLUMN imei TEXT;

-- Copy data from 'description' to 'imei'
UPDATE invoice_items SET imei = description WHERE description IS NOT NULL;

-- Drop the old 'description' column
ALTER TABLE invoice_items DROP COLUMN description;

-- Add comment to document the change
COMMENT ON COLUMN invoice_items.imei IS 'IMEI of the product (replaces old description field)';