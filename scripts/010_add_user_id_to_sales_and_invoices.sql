-- Add user_id column to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to invoice_items table
ALTER TABLE invoice_items
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_user_id ON invoice_items(user_id);

-- Enable RLS on sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoices table
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoice_items table
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales
CREATE POLICY "Users can view their own sales" ON sales
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" ON sales
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" ON sales
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" ON sales
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON invoices
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON invoices
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON invoices
FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for invoice_items
CREATE POLICY "Users can view their own invoice items" ON invoice_items
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice items" ON invoice_items
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice items" ON invoice_items
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice items" ON invoice_items
FOR DELETE USING (auth.uid() = user_id);