import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  category?: { name: string } | null;
  product_images?: { url: string; is_primary: boolean }[];
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  const searchResults = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          description,
          category:categories(name),
          product_images(url, is_primary)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
        .limit(8);

      if (error) throw error;
      return (data || []) as SearchProduct[];
    },
    enabled: debouncedQuery.length >= 2,
  });

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    isOpen,
    openSearch,
    closeSearch,
    results: searchResults.data || [],
    isLoading: searchResults.isLoading,
  };
}
