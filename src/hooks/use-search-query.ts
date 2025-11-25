'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/react-query';

export interface SearchResult {
  entity_type: 'customer' | 'deal' | 'product' | 'invoice';
  entity_id: string;
  title: string;
  subtitle: string;
  rank: number;
}

// Global search across all entities
export function useGlobalSearch(query: string, enabled: boolean = true) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.search.global(query),
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query.trim()) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_global', {
        query_text: query.trim()
      });

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      return data || [];
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    // Don't retry search queries as aggressively
    retry: 1,
  });
}

// Search customers specifically
export function useCustomerSearch(query: string, enabled: boolean = true) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.search.customers(query),
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_customers', {
        query_text: query.trim()
      });

      if (error) {
        throw new Error(`Customer search failed: ${error.message}`);
      }

      return data || [];
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Search deals specifically  
export function useDealsSearch(query: string, enabled: boolean = true) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.search.deals(query),
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_deals', {
        query_text: query.trim()
      });

      if (error) {
        throw new Error(`Deals search failed: ${error.message}`);
      }

      return data || [];
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Search products specifically
export function useProductsSearch(query: string, enabled: boolean = true) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.search.products(query),
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_products', {
        query_text: query.trim()
      });

      if (error) {
        throw new Error(`Products search failed: ${error.message}`);
      }

      return data || [];
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Combined hook for managing search state with debouncing
export function useSearchWithDebounce(initialQuery: string = '', debounceMs: number = 300) {
  const [query, setQuery] = React.useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);

  // Debounce the search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Global search with debounced query
  const globalSearch = useGlobalSearch(debouncedQuery, debouncedQuery.length > 2);
  const customerSearch = useCustomerSearch(debouncedQuery, debouncedQuery.length > 2);
  const dealsSearch = useDealsSearch(debouncedQuery, debouncedQuery.length > 2);
  const productsSearch = useProductsSearch(debouncedQuery, debouncedQuery.length > 2);

  return {
    query,
    setQuery,
    debouncedQuery,
    searches: {
      global: globalSearch,
      customers: customerSearch,
      deals: dealsSearch,
      products: productsSearch
    },
    isSearching: globalSearch.isFetching || customerSearch.isFetching || 
                dealsSearch.isFetching || productsSearch.isFetching,
    hasError: globalSearch.isError || customerSearch.isError || 
              dealsSearch.isError || productsSearch.isError
  };
}