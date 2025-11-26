'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from './use-debounce';
import { logger } from '@/lib/logger';

export interface SearchResult {
  entity_type: 'customer' | 'deal' | 'product' | 'invoice';
  entity_id: string;
  title: string;
  subtitle: string;
  rank: number;
}

export interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null
  });

  const debouncedQuery = useDebounce(query, 300);
  const supabase = createClient();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchState({
        results: [],
        loading: false,
        error: null
      });
      return;
    }

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.rpc('search_global', {
        query_text: searchQuery.trim()
      });

      if (error) {
        throw error;
      }

      setSearchState({
        results: data || [],
        loading: false,
        error: null
      });
    } catch (err) {
      logger.error('Search error', err instanceof Error ? err : new Error(String(err)));
      setSearchState({
        results: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Search failed'
      });
    }
  }, [supabase]);

  // Perform search when debounced query changes
  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const searchCustomers = useCallback(async (searchQuery: string) => {
    const { data, error } = await supabase.rpc('search_customers', {
      query_text: searchQuery.trim()
    });

    if (error) throw error;
    return data || [];
  }, [supabase]);

  const searchDeals = useCallback(async (searchQuery: string) => {
    const { data, error } = await supabase.rpc('search_deals', {
      query_text: searchQuery.trim()
    });

    if (error) throw error;
    return data || [];
  }, [supabase]);

  const searchProducts = useCallback(async (searchQuery: string) => {
    const { data, error } = await supabase.rpc('search_products', {
      query_text: searchQuery.trim()
    });

    if (error) throw error;
    return data || [];
  }, [supabase]);

  return {
    query,
    setQuery,
    searchState,
    search,
    searchCustomers,
    searchDeals,
    searchProducts
  };
}