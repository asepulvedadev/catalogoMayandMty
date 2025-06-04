import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

interface RecommendationResponse {
  products: Product[];
  hasMore: boolean;
  preferences?: {
    categories: Record<string, number>;
    materials: Record<string, number>;
    price_range: {
      min: number;
      max: number;
      avg: number;
    };
    interaction_patterns: {
      total_interactions: number;
      unique_products: number;
      last_interaction: string;
    };
  };
}

export function useRecommendations(limit: number = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const loadRecommendations = async (reset: boolean = false) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const currentOffset = reset ? 0 : offset;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recommend-products?` +
        new URLSearchParams({
          userId: user?.id || '',
          limit: limit.toString(),
          offset: currentOffset.toString(),
        }),
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar recomendaciones');
      }

      const data: RecommendationResponse = await response.json();
      
      setProducts(prev => reset ? data.products : [...prev, ...data.products]);
      setHasMore(data.hasMore);
      setOffset(currentOffset + limit);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations(true);
  }, []);

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore: () => loadRecommendations(false),
  };
}