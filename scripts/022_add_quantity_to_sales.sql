-- Migration: Add quantity column to sales table
-- This allows sales to represent multiple units

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Update existing records to have quantity 1 if they don't have it
UPDATE public.sales SET quantity = 1 WHERE quantity IS NULL OR quantity = 0;

-- Add comment
COMMENT ON COLUMN public.sales.quantity IS 'Number of units in this sale';