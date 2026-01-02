-- Add collection_id to products table to link products to collections
ALTER TABLE public.products 
ADD COLUMN collection_id uuid REFERENCES public.collections(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_products_collection_id ON public.products(collection_id);