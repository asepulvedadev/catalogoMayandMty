import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { supabase } from '../lib/supabase';
import type { Product, ProductCategory, Material } from '../types/product';

interface SearchFilters {
  category?: ProductCategory;
  material?: Material;
}

interface SearchState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const ITEMS_PER_PAGE = 12;

export function useSearch(initialFilters?: SearchFilters) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [state, setState] = useState<SearchState>({
    products: [],
    loading: false,
    error: null,
  });
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchProducts = useCallback(async (isLoadMore: boolean = false) => {
    // Cancelar la búsqueda anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isLoadMore) {
      setState(prev => ({ ...prev, loading: true }));
    }

    try {
      const currentOffset = isLoadMore ? offset : 0;
      
      const { data, error } = await supabase
        .rpc('search_products', {
          search_query: debouncedSearchTerm || null,
          category_filter: filters.category,
          material_filter: filters.material,
          p_limit: ITEMS_PER_PAGE,
          p_offset: currentOffset
        });

      if (error) throw error;

      if (!isLoadMore) {
        setState({
          products: data || [],
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          products: [...prev.products, ...(data || [])],
          loading: false,
          error: null
        }));
      }

      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
      setOffset(currentOffset + ITEMS_PER_PAGE);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error en la búsqueda'
      }));
    }
  }, [debouncedSearchTerm, filters, offset]);

  useEffect(() => {
    setOffset(0);
    searchProducts();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearchTerm, filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setOffset(0);
  };

  const loadMore = useCallback(() => {
    if (!state.loading && hasMore) {
      searchProducts(true);
    }
  }, [state.loading, hasMore, searchProducts]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    loadMore,
    hasMore,
    ...state,
  };
}