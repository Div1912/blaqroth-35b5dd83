import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EditorialGridItem {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link: string;
  display_order: number;
  is_active: boolean;
}

export function useEditorialGrid() {
  return useQuery({
    queryKey: ['editorial-grid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editorial_grid_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return (data || []) as EditorialGridItem[];
    },
  });
}
