-- Add user_id column to sales table if it doesn't exist
-- This ensures the sales table has proper user isolation

ALTER TABLE sales
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- Enable RLS on sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Update existing RLS policies to use user_id instead of allowing all
DROP POLICY IF EXISTS "Allow all operations on sales" ON sales;

-- Create proper RLS policies for sales
CREATE POLICY "Users can view their own sales" ON sales
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" ON sales
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" ON sales
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" ON sales
FOR DELETE USING (auth.uid() = user_id);