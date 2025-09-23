-- Migration: Add product details columns to invoice_items table
-- This script adds marque, modele, and provenance columns to match product structure

-- Add the new columns
ALTER TABLE invoice_items ADD COLUMN marque TEXT;
ALTER TABLE invoice_items ADD COLUMN modele TEXT;
ALTER TABLE invoice_items ADD COLUMN provenance TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN invoice_items.marque IS 'Brand of the product';
COMMENT ON COLUMN invoice_items.modele IS 'Model of the product';
COMMENT ON COLUMN invoice_items.provenance IS 'Origin/provenance of the product';