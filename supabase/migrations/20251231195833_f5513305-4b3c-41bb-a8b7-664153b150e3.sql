-- Create collections table
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR DEFAULT '#c9a962',
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Public can view active collections
CREATE POLICY "Public can view active collections"
ON public.collections
FOR SELECT
USING (is_active = true);

-- Admins can manage collections
CREATE POLICY "Admins can manage collections"
ON public.collections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default collections
INSERT INTO public.collections (name, slug, description, color, display_order) VALUES
('NOIR COLLECTION', 'noir', 'A meditation on darkness. Pure black expressions that transcend seasons.', '#0a0a0a', 1),
('ECLIPSE', 'eclipse', 'Where shadow meets light. Tonal explorations in charcoal and ivory.', '#2a2a2a', 2),
('GILDED', 'gilded', 'Subtle metallic accents. Understated luxury for those who know.', '#c9a962', 3);