import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES, QUERY_KEYS } from '@/lib/queryConfig';
import { fetchHeroSlides, type HeroSlide } from '@/lib/data/content';

// Re-export type for backward compatibility
export type { HeroSlide };

export function useHeroSlides() {
  return useQuery({
    queryKey: QUERY_KEYS.heroSlides,
    queryFn: fetchHeroSlides,
    staleTime: CACHE_TIMES.PUBLIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
