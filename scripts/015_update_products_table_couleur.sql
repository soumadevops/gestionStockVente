-- Migration: Update products table to replace 'modele' with 'couleur'
-- This script renames the 'modele' column to 'couleur' in the products table

-- First, add the new 'couleur' column
ALTER TABLE products ADD COLUMN couleur TEXT;

-- Copy data from 'modele' to 'couleur'
UPDATE products SET couleur = modele WHERE modele IS NOT NULL;

-- Make 'couleur' column NOT NULL if 'modele' was NOT NULL
-- (assuming 'modele' was nullable based on the interface)

-- Drop the old 'modele' column
ALTER TABLE products DROP COLUMN modele;

-- Add comment to document the change
COMMENT ON COLUMN products.couleur IS 'Color of the product (replaces old modele field)';