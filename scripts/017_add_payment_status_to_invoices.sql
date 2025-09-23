-- Migration: Add payment_status column to invoices table
-- This script adds a new payment_status column to track payment status

-- Add the new 'payment_status' column with default value 'unpaid'
ALTER TABLE invoices ADD COLUMN payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

-- Update existing records to have 'paid' status if they were already marked as paid in the status column
UPDATE invoices SET payment_status = 'paid' WHERE status = 'paid';

-- Add comment to document the new field
COMMENT ON COLUMN invoices.payment_status IS 'Payment status of the invoice: unpaid, paid, or refunded';