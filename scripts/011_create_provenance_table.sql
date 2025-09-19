-- Create provenance table to store product origins/sources
CREATE TABLE IF NOT EXISTS provenances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom_provenance VARCHAR(255) NOT NULL,
    description TEXT,
    pays_origine VARCHAR(100),
    contact_fournisseur VARCHAR(255),
    email_fournisseur VARCHAR(255),
    telephone_fournisseur VARCHAR(50),
    adresse_fournisseur TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(nom_provenance, user_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_provenances_user_id ON provenances(user_id);
CREATE INDEX IF NOT EXISTS idx_provenances_nom_provenance ON provenances(nom_provenance);

-- Enable Row Level Security (RLS)
ALTER TABLE provenances ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own provenances" ON provenances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provenances" ON provenances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provenances" ON provenances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provenances" ON provenances
    FOR DELETE USING (auth.uid() = user_id);

-- Insert some default provenances
INSERT INTO provenances (nom_provenance, description, pays_origine, user_id) VALUES
('Chine', 'Fournisseur principal en Chine', 'Chine', '00000000-0000-0000-0000-000000000000'),
('France', 'Fournisseurs locaux français', 'France', '00000000-0000-0000-0000-000000000000'),
('États-Unis', 'Importations depuis les USA', 'États-Unis', '00000000-0000-0000-0000-000000000000'),
('Corée du Sud', 'Électronique Samsung et autres', 'Corée du Sud', '00000000-0000-0000-0000-000000000000'),
('Autre', 'Autres provenances', NULL, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (nom_provenance, user_id) DO NOTHING;

-- Update the products table to reference provenance
ALTER TABLE products ADD COLUMN IF NOT EXISTS provenance_id UUID REFERENCES provenances(id) ON DELETE SET NULL;

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS idx_products_provenance_id ON products(provenance_id);