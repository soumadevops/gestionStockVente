-- Add invoice_id column to sales table to link sales with invoices
-- This enables synchronization between invoices and sales

ALTER TABLE sales
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sales_invoice_id ON sales(invoice_id);

-- Update RLS policies to allow operations when invoice_id is set (for synchronized sales)
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert their own sales" ON sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;

-- Create new RLS policies that allow access to sales linked to user's invoices
CREATE POLICY "Users can view their own sales and invoice-linked sales" ON sales
FOR SELECT USING (
  auth.uid() = user_id OR
  invoice_id IN (
    SELECT id FROM invoices WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own sales and invoice-linked sales" ON sales
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR
  (invoice_id IS NOT NULL AND invoice_id IN (
    SELECT id FROM invoices WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Users can update their own sales and invoice-linked sales" ON sales
FOR UPDATE USING (
  auth.uid() = user_id OR
  invoice_id IN (
    SELECT id FROM invoices WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own sales and invoice-linked sales" ON sales
FOR DELETE USING (
  auth.uid() = user_id OR
  invoice_id IN (
    SELECT id FROM invoices WHERE user_id = auth.uid()
  )
);