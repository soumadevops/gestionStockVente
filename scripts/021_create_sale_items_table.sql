-- Migration: Create sale_items table for handling multiple units per sale
-- Each sale can have multiple items with individual color and IMEI

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  marque TEXT NOT NULL,
  couleur TEXT NOT NULL,
  imei TEXT NOT NULL UNIQUE,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Create policies for sale_items table
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_imei ON public.sale_items(imei);

-- Add comment
COMMENT ON TABLE public.sale_items IS 'Individual items/units within a sale, each with their own color and IMEI';