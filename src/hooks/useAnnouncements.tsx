import { useQuery } from '@tanstack/react-query';
import { CACHE_TIMES, QUERY_KEYS } from '@/lib/queryConfig';
import { fetchActiveAnnouncement, type Announcement } from '@/lib/data/content';

// Re-export type for backward compatibility
export type { Announcement };

export function useAnnouncements() {
  return useQuery({
    queryKey: QUERY_KEYS.announcements,
    queryFn: fetchActiveAnnouncement,
    staleTime: CACHE_TIMES.PUBLIC_DATA,
    gcTime: CACHE_TIMES.GC_TIME,
  });
}
