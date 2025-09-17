-- Create storage bucket for product photos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-photos', 'product-photos', true);

-- Create policy to allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-photos' AND auth.role() = 'authenticated');

-- Create policy to allow public read access to photos
CREATE POLICY "Allow public read access to photos" ON storage.objects
FOR SELECT USING (bucket_id = 'product-photos');

-- Create policy to allow authenticated users to update their photos
CREATE POLICY "Allow authenticated users to update photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-photos' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete photos
CREATE POLICY "Allow authenticated users to delete photos" ON storage.objects
FOR DELETE USING (bucket_id = 'product-photos' AND auth.role() = 'authenticated');
