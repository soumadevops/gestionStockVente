-- Migration: Remove couleur column from products table
-- This column is no longer needed as color information will be handled differently

ALTER TABLE public.products DROP COLUMN IF EXISTS couleur;

-- Add comment to document the change
COMMENT ON TABLE public.products IS 'Products table without couleur column - color handled via sale_items for multi-unit sales';