-- Create products table for stock management with photo support
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_produit TEXT NOT NULL,
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  prix_unitaire NUMERIC NOT NULL,
  quantite_stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  photo_url TEXT, -- URL for product photo
  imei_telephone TEXT, -- For phones specifically
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_marque_modele ON products(marque, modele);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
