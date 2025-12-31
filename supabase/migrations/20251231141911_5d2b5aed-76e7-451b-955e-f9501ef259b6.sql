-- Add fulfillment columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS fulfillment_status character varying DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS delivery_mode character varying DEFAULT 'self',
ADD COLUMN IF NOT EXISTS shipping_partner character varying,
ADD COLUMN IF NOT EXISTS tracking_id character varying;

-- Update order_items to store snapshot data
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS color character varying,
ADD COLUMN IF NOT EXISTS size character varying,
ADD COLUMN IF NOT EXISTS sku character varying,
ADD COLUMN IF NOT EXISTS original_price numeric,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- Create order_status_history table for audit log
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status character varying,
  new_status character varying NOT NULL,
  old_fulfillment_status character varying,
  new_fulfillment_status character varying,
  changed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_status_history
CREATE POLICY "Users can view their order history" ON public.order_status_history
FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.customer_id = auth.uid())
);

CREATE POLICY "Admins can view all order history" ON public.order_status_history
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert order history" ON public.order_status_history
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create offers table
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  discount_type character varying NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value numeric NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  applies_to character varying DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'variants')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for offers
CREATE POLICY "Public can view active offers" ON public.offers
FOR SELECT USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins can manage offers" ON public.offers
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create offer_products mapping table
CREATE TABLE IF NOT EXISTS public.offer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(offer_id, product_id)
);

-- Enable RLS on offer_products
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view offer products" ON public.offer_products
FOR SELECT USING (true);

CREATE POLICY "Admins can manage offer products" ON public.offer_products
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create offer_variants mapping table
CREATE TABLE IF NOT EXISTS public.offer_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(offer_id, variant_id)
);

-- Enable RLS on offer_variants
ALTER TABLE public.offer_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view offer variants" ON public.offer_variants
FOR SELECT USING (true);

CREATE POLICY "Admins can manage offer variants" ON public.offer_variants
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create function to log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.fulfillment_status IS DISTINCT FROM NEW.fulfillment_status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status, old_fulfillment_status, new_fulfillment_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, OLD.fulfillment_status, NEW.fulfillment_status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS order_status_change_trigger ON public.orders;
CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));