-- Migration: Create invoice_item_units table for storing individual unit details
-- This script creates a new table to store color and IMEI for each unit when quantity >= 2

CREATE TABLE IF NOT EXISTS invoice_item_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_item_id UUID NOT NULL REFERENCES invoice_items(id) ON DELETE CASCADE,
  unit_index INTEGER NOT NULL, -- 0-based index of the unit within the item
  color TEXT NOT NULL,
  imei TEXT NOT NULL UNIQUE, -- IMEI must be unique across all units
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_item_units_invoice_item_id ON invoice_item_units(invoice_item_id);
CREATE INDEX IF NOT EXISTS idx_invoice_item_units_imei ON invoice_item_units(imei);

-- Enable RLS
ALTER TABLE invoice_item_units ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own invoice item units" ON invoice_item_units;
DROP POLICY IF EXISTS "Users can insert their own invoice item units" ON invoice_item_units;
DROP POLICY IF EXISTS "Users can update their own invoice item units" ON invoice_item_units;
DROP POLICY IF EXISTS "Users can delete their own invoice item units" ON invoice_item_units;

CREATE POLICY "Users can view their own invoice item units" ON invoice_item_units
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.id = invoice_item_units.invoice_item_id
    AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own invoice item units" ON invoice_item_units
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.id = invoice_item_units.invoice_item_id
    AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own invoice item units" ON invoice_item_units
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.id = invoice_item_units.invoice_item_id
    AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own invoice item units" ON invoice_item_units
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM invoice_items ii
    JOIN invoices i ON ii.invoice_id = i.id
    WHERE ii.id = invoice_item_units.invoice_item_id
    AND i.user_id = auth.uid()
  )
);

-- Add comment
COMMENT ON TABLE invoice_item_units IS 'Stores individual unit details (color, IMEI) for invoice items with quantity >= 2';
COMMENT ON COLUMN invoice_item_units.unit_index IS '0-based index of the unit within the invoice item';
COMMENT ON COLUMN invoice_item_units.color IS 'Color of the individual unit';
COMMENT ON COLUMN invoice_item_units.imei IS 'Unique IMEI of the individual unit';