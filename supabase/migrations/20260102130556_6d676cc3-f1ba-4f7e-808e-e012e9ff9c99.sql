-- =====================================================
-- FEATURE 1: Admin-controlled Announcements
-- =====================================================
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  link text,
  link_text text,
  is_active boolean DEFAULT false,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active announcements
CREATE POLICY "Public can view active announcements" ON public.announcements
  FOR SELECT USING (
    is_active = true 
    AND (start_date IS NULL OR now() >= start_date)
    AND (end_date IS NULL OR now() <= end_date)
  );

-- =====================================================
-- FEATURE 2: Hero Slides (Supabase-driven)
-- =====================================================
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url text NOT NULL,
  media_type text DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  headline text NOT NULL,
  subheadline text,
  primary_cta_text text,
  primary_cta_link text,
  secondary_cta_text text,
  secondary_cta_link text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Admins can manage hero slides
CREATE POLICY "Admins can manage hero slides" ON public.hero_slides
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active hero slides
CREATE POLICY "Public can view active hero slides" ON public.hero_slides
  FOR SELECT USING (is_active = true);

-- =====================================================
-- FEATURE 3: Shipping / Return Policy Configuration
-- =====================================================
CREATE TABLE public.shipping_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL UNIQUE,
  config_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage config
CREATE POLICY "Admins can manage shipping config" ON public.shipping_config
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view config
CREATE POLICY "Public can view shipping config" ON public.shipping_config
  FOR SELECT USING (true);

-- Insert default shipping/return configs
INSERT INTO public.shipping_config (config_key, config_value, description) VALUES
  ('standard_delivery_days', '5-7', 'Standard delivery time range in days'),
  ('express_delivery_days', '2-3', 'Express delivery time range in days'),
  ('free_shipping_threshold', '2999', 'Minimum order value for free shipping in INR'),
  ('return_window_days', '7', 'Number of days for return eligibility'),
  ('return_policy', 'Easy returns within 7 days of delivery', 'Return policy message'),
  ('shipping_cost', '99', 'Standard shipping cost in INR');

-- =====================================================
-- FEATURE 4: Product Returns System
-- =====================================================
CREATE TABLE public.returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES public.order_items(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  reason text NOT NULL,
  additional_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Admins can manage all returns
CREATE POLICY "Admins can manage returns" ON public.returns
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own returns
CREATE POLICY "Users can view their own returns" ON public.returns
  FOR SELECT USING (auth.uid() = customer_id);

-- Users can create return requests
CREATE POLICY "Users can create returns" ON public.returns
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- =====================================================
-- FEATURE 5: Editorial Grid Items (Admin-controlled)
-- =====================================================
CREATE TABLE public.editorial_grid_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  link text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.editorial_grid_items ENABLE ROW LEVEL SECURITY;

-- Admins can manage editorial items
CREATE POLICY "Admins can manage editorial items" ON public.editorial_grid_items
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active items
CREATE POLICY "Public can view active editorial items" ON public.editorial_grid_items
  FOR SELECT USING (is_active = true);

-- Insert default editorial items
INSERT INTO public.editorial_grid_items (title, subtitle, image_url, link, display_order) VALUES
  ('New Season', 'Spring/Summer Collection', '/placeholder.svg', '/collections', 1),
  ('Essentials', 'Timeless Wardrobe Staples', '/placeholder.svg', '/shop?category=essentials', 2),
  ('Outerwear', 'Layer Up in Style', '/placeholder.svg', '/shop?category=outerwear', 3),
  ('Accessories', 'Complete Your Look', '/placeholder.svg', '/shop?category=accessories', 4);