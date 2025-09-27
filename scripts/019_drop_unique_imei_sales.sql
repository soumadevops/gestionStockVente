-- Drop unique constraint on imei_telephone in sales table
-- This allows multiple sales records with the same IMEI (e.g., for invoice synchronization)

ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_imei_telephone_key;