import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { supabase } from '../lib/supabase';
import type { Product, ProductCategory, Material } from '../types/product';

interface SearchFilters {
  category?: ProductCategory;
  material?: Material;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface SearchState {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

interface CacheEntry {
  products: Product[];
  totalCount: number;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ITEMS_PER_PAGE = 12;

export function useSearch(initialFilters?: SearchFilters) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});
  const [page, setPage] = useState(0);
  const [state, setState] = useState<SearchState>({
    products: [],
    loading: false,
    error: null,
    totalCount: 0,
  });

  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const debouncedSearchTerm = useDebounce(searchTerm);

  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      term: debouncedSearchTerm,
      filters,
      page,
    });
  }, [debouncedSearchTerm, filters, page]);

  const getCachedData = useCallback(() => {
    const key = getCacheKey();
    const cached = cache.current.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      cache.current.delete(key);
      return null;
    }
    
    return cached;
  }, [getCacheKey]);

  const setCachedData = useCallback((data: Omit<CacheEntry, 'timestamp'>) => {
    const key = getCacheKey();
    cache.current.set(key, { ...data, timestamp: Date.now() });
  }, [getCacheKey]);

  const searchProducts = useCallback(async () => {
    const cachedData = getCachedData();
    if (cachedData) {
      setState({
        products: cachedData.products,
        loading: false,
        error: null,
        totalCount: cachedData.totalCount,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error, count } = await supabase
        .rpc('search_products', {
          search_query: debouncedSearchTerm || null,
          category_filter: filters.category,
          material_filter: filters.material,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          sort_by: filters.sortBy || 'relevance',
          sort_direction: filters.sortDirection || 'desc',
          p_limit: ITEMS_PER_PAGE,
          p_offset: page * ITEMS_PER_PAGE,
        });

      if (error) throw error;

      const newState = {
        products: data || [],
        totalCount: count || 0,
      };

      setCachedData(newState);
      setState({
        ...newState,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error en la búsqueda',
      }));
    }
  }, [debouncedSearchTerm, filters, page, getCachedData, setCachedData]);

  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  };

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    page,
    setPage,
    loadMore,
    ...state,
    pageCount: Math.ceil(state.totalCount / ITEMS_PER_PAGE),
  };
}