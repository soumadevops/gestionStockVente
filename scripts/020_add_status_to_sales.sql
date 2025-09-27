-- Add status column to sales table for workflow management
-- Status can be: 'pending', 'invoiced', 'paid'

ALTER TABLE sales
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);