import { supabase } from '@/integrations/supabase/client';

// Hero Slides
export interface HeroSlide {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  headline: string;
  subheadline: string | null;
  primary_cta_text: string | null;
  primary_cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  display_order: number;
  is_active: boolean;
}

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return (data || []) as HeroSlide[];
}

// Announcements
export interface Announcement {
  id: string;
  message: string;
  link: string | null;
  link_text: string | null;
  is_active: boolean;
}

export async function fetchActiveAnnouncement(): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data as Announcement | null;
}

// Editorial Grid
export interface EditorialGridItem {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string;
  display_order: number;
  is_active: boolean;
}

export async function fetchEditorialGrid(): Promise<EditorialGridItem[]> {
  const { data, error } = await supabase
    .from('editorial_grid_items')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return (data || []) as EditorialGridItem[];
}

// Shipping Config
export interface ShippingConfig {
  id: string;
  config_key: string;
  config_value: string;
  description: string | null;
}

export async function fetchShippingConfig(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('shipping_config')
    .select('*');
  
  if (error) throw error;
  
  // Convert to a key-value map for easy access
  const configMap: Record<string, string> = {};
  (data || []).forEach((item: ShippingConfig) => {
    configMap[item.config_key] = item.config_value;
  });
  
  return configMap;
}
