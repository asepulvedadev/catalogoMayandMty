import { useState, useEffect, useCallback } from 'react';
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

  const debouncedSearchTerm = useDebounce(searchTerm);
  const ITEMS_PER_PAGE = 12;

  const searchProducts = useCallback(async () => {
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

      setState({
        products: data || [],
        loading: false,
        error: null,
        totalCount: count || 0,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error en la búsqueda',
      }));
    }
  }, [debouncedSearchTerm, filters, page]);

  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    page,
    setPage,
    ...state,
    pageCount: Math.ceil(state.totalCount / ITEMS_PER_PAGE),
  };
}