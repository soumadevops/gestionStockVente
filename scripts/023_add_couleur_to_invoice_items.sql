-- Migration: Add couleur column to invoice_items table
-- This script adds the couleur column to match the product structure

ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS couleur TEXT;

-- Add comment to document the column
COMMENT ON COLUMN invoice_items.couleur IS 'Color of the product item';