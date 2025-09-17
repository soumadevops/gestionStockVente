-- Fix ambiguous column reference in generate_invoice_number function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Obtenir le prochain numéro de facture avec qualification explicite de la table
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoices.invoice_number FROM 'INV-(\\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoices.invoice_number ~ '^INV-\\d+$';
  
  -- Formater le numéro de facture
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;
