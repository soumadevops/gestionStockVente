-- Migration: Add nom_produit column to sales table
-- This script adds the nom_produit column to track the product name in sales

ALTER TABLE sales ADD COLUMN IF NOT EXISTS nom_produit TEXT;

-- Add comment to document the column
COMMENT ON COLUMN sales.nom_produit IS 'Product name from inventory (added for product selection feature)';