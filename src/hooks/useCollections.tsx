import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CACHE_TIMES, QUERY_KEYS } from '@/lib/queryConfig';
import { fetchCollections, fetchCollection, type Collection } from '@/lib/data/collections';

// Re-export type for backward compatibility
export type { Collection };

export const useCollections = (includeInactive = false) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for admin updates
  useEffect(() => {
    const channel = supabase
      .channel('collections-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collections' },
        () => {
          // Invalidate and refetch collections when any change occurs
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: [...QUERY_KEYS.collections, includeInactive],
    queryFn: () => fetchCollections(includeInactive),
    staleTime: CACHE_TIMES.STATIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
};

export const useCollection = (slug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.collection(slug),
    queryFn: () => fetchCollection(slug),
    staleTime: CACHE_TIMES.STATIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
    enabled: !!slug,
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Collection> }) => {
      const { data, error } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
    },
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('collections')
        .insert(collection)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collections });
    },
  });
};
