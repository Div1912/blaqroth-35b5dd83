import { supabase } from '@/integrations/supabase/client';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// Fetch all collections (public - only active)
export async function fetchCollections(includeInactive = false): Promise<Collection[]> {
  let query = supabase
    .from('collections')
    .select('*')
    .order('display_order', { ascending: true });

  // For public pages, only show active collections
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Collection[];
}

// Fetch single collection by slug
export async function fetchCollection(slug: string): Promise<Collection> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Collection;
}
