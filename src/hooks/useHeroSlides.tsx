import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data || []) as HeroSlide[];
    },
  });
}
