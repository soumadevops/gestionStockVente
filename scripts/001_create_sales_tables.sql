-- Create sales table for phone sales management
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_prenom_client TEXT NOT NULL,
  numero_telephone TEXT NOT NULL,
  date_vente DATE NOT NULL DEFAULT CURRENT_DATE,
  modele TEXT NOT NULL,
  marque TEXT NOT NULL,
  imei_telephone TEXT NOT NULL UNIQUE,
  prix DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_compagnie TEXT NOT NULL DEFAULT 'Ma Compagnie',
  nom_admin TEXT NOT NULL DEFAULT 'Administrateur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default company settings
INSERT INTO public.company_settings (nom_compagnie, nom_admin) 
VALUES ('VentesPro', 'Admin')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for sales table (allow all operations for now - can be restricted later with auth)
CREATE POLICY "Allow all operations on sales" ON public.sales
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for company_settings table
CREATE POLICY "Allow all operations on company_settings" ON public.company_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_date_vente ON public.sales(date_vente);
CREATE INDEX IF NOT EXISTS idx_sales_marque ON public.sales(marque);
CREATE INDEX IF NOT EXISTS idx_sales_imei ON public.sales(imei_telephone);
