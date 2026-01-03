import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES, QUERY_KEYS } from '@/lib/queryConfig';
import { fetchEditorialGrid, type EditorialGridItem } from '@/lib/data/content';

// Re-export type for backward compatibility
export type { EditorialGridItem };

export function useEditorialGrid() {
  return useQuery({
    queryKey: QUERY_KEYS.editorialGrid,
    queryFn: fetchEditorialGrid,
    staleTime: CACHE_TIMES.PUBLIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
