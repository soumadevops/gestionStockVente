-- Add user_id column to company_settings table
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique constraint to ensure one settings record per user
ALTER TABLE company_settings
ADD CONSTRAINT unique_user_settings UNIQUE (user_id);

-- Update existing records to have a default user_id (if any exist)
-- Note: This assumes you have a default user, replace with actual user ID
-- UPDATE company_settings SET user_id = 'your-default-user-id' WHERE user_id IS NULL;

-- Enable RLS on company_settings table
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_settings
CREATE POLICY "Users can view their own company settings" ON company_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company settings" ON company_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company settings" ON company_settings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company settings" ON company_settings
FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);