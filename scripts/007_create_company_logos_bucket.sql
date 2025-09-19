-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true);

-- Set up RLS policies for company logos bucket
CREATE POLICY "Users can upload their own company logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own company logos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own company logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own company logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);