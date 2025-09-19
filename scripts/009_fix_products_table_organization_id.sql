-- Add organization_id column to products table for multi-tenant support
ALTER TABLE products
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add user_id column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);

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

-- Update existing products to have user_id (if any exist without user_id)
-- Note: This will need to be run after users exist in the system
-- UPDATE products SET user_id = auth.uid() WHERE user_id IS NULL;