import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

interface RecommendationResponse {
  preferences: {
    categories: string[];
    materials: string[];
    price_range: [number, number];
    interests: string[];
  };
  ml_features: number[];
  recommendations: {
    categories: string[];
    products: string[];
    explanation: string;
  };
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Obtener perfil existente
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Si no hay perfil o está desactualizado, generar uno nuevo
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        if (!profile || profile.last_updated < oneHourAgo) {
          const { data: analysis } = await supabase.functions.invoke<RecommendationResponse>(
            'analyze-user',
            { body: { userId: user.id } }
          );

          if (analysis) {
            setRecommendations(analysis);

            // Buscar productos recomendados
            const { data: recommendedProducts } = await supabase
              .rpc('search_products', {
                search_query: analysis.recommendations.products.join(' '),
                category_filter: null,
                material_filter: null,
                min_price: analysis.preferences.price_range[0],
                max_price: analysis.preferences.price_range[1],
                sort_by: 'relevance',
                sort_direction: 'desc',
                p_limit: 12,
                p_offset: 0
              });

            if (recommendedProducts) {
              setProducts(recommendedProducts);
            }
          }
        } else {
          setRecommendations(profile.preferences);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar recomendaciones');
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  return {
    recommendations,
    products,
    loading,
    error
  };
}