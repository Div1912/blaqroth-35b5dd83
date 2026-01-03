import { QueryClient } from '@tanstack/react-query';

// Cache durations in milliseconds
export const CACHE_TIMES = {
  // Public, read-only data - cache for 5 minutes
  PUBLIC_DATA: 5 * 60 * 1000,
  // Semi-static data (collections, categories) - cache for 10 minutes
  STATIC_DATA: 10 * 60 * 1000,
  // Dynamic data (cart, auth) - no cache
  NO_CACHE: 0,
  // Garbage collection time - keep unused data for 30 minutes
  GC_TIME: 30 * 60 * 1000,
} as const;

// Query keys for cache management
export const QUERY_KEYS = {
  // Public data (cacheable)
  products: ['products'] as const,
  product: (slug: string) => ['product', slug] as const,
  collections: ['collections'] as const,
  collection: (slug: string) => ['collection', slug] as const,
  categories: ['categories'] as const,
  heroSlides: ['hero-slides'] as const,
  announcements: ['announcements'] as const,
  editorialGrid: ['editorial-grid'] as const,
  shippingConfig: ['shipping-config'] as const,
  activeOffers: ['active-offers'] as const,
  
  // User-specific data (not cacheable across users)
  cart: ['cart'] as const,
  orders: ['orders'] as const,
  wishlist: ['wishlist'] as const,
  notifications: ['notifications'] as const,
} as const;

// Create QueryClient with optimized defaults
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Default staleTime for all queries
      staleTime: CACHE_TIMES.PUBLIC_DATA,
      // How long to keep unused data in cache
      gcTime: CACHE_TIMES.GC_TIME,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
    },
  },
});

