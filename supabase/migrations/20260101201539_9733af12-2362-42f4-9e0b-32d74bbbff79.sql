-- Create storage bucket for collection images
INSERT INTO storage.buckets (id, name, public)
VALUES ('collection-images', 'collection-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to collection images
CREATE POLICY "Public can view collection images"
ON storage.objects FOR SELECT
USING (bucket_id = 'collection-images');

-- Allow admins to upload collection images
CREATE POLICY "Admins can upload collection images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'collection-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update collection images
CREATE POLICY "Admins can update collection images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'collection-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete collection images
CREATE POLICY "Admins can delete collection images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'collection-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);