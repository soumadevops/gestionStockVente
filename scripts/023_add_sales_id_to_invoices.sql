-- Migration: Add sales_id to invoices table for proper Sales-Invoice relationship
-- This creates a bidirectional relationship between sales and invoices

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sales_id UUID REFERENCES public.sales(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_sales_id ON public.invoices(sales_id);

-- Add comment
COMMENT ON COLUMN public.invoices.sales_id IS 'Reference to the sale that generated this invoice';