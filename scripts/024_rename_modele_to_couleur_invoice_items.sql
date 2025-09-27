-- Migration: Rename 'modele' column to 'couleur' in invoice_items table
-- This aligns with the color information being stored in sale_items

-- Rename the column
ALTER TABLE public.invoice_items RENAME COLUMN modele TO couleur;

-- Add comment to document the change
COMMENT ON COLUMN public.invoice_items.couleur IS 'Color of the product item (renamed from modele)';