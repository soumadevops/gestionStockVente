-- Add user_id column to products table if it doesn't exist
-- This ensures the products table has proper user isolation

ALTER TABLE products
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Users can view their own products" ON products
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON products
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
FOR DELETE USING (auth.uid() = user_id);