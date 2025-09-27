-- Fix missing user_id column in invoice_items table
-- This script ensures the user_id column exists in invoice_items

-- Add user_id column to invoice_items table if it doesn't exist
DO $$
BEGIN
   IF NOT EXISTS (
     SELECT 1 FROM information_schema.columns
     WHERE table_name = 'invoice_items'
     AND column_name = 'user_id'
     AND table_schema = 'public'
   ) THEN
     ALTER TABLE public.invoice_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
     RAISE NOTICE 'Added user_id column to invoice_items table';
   ELSE
     RAISE NOTICE 'user_id column already exists in invoice_items table';
   END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_user_id ON public.invoice_items(user_id);

-- Ensure RLS is enabled
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to ensure they exist
DROP POLICY IF EXISTS "Users can view their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update their own invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete their own invoice items" ON public.invoice_items;

CREATE POLICY "Users can view their own invoice items" ON public.invoice_items
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoice items" ON public.invoice_items
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice items" ON public.invoice_items
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice items" ON public.invoice_items
FOR DELETE USING (auth.uid() = user_id);