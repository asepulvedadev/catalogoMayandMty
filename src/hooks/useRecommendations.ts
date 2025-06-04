import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';

export function useRecommendations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        
        // Get most interacted products using a raw query with group by
        const { data: interactions } = await supabase
          .rpc('get_popular_products', { limit_count: 8 });

        if (interactions?.length) {
          const productIds = interactions.map(i => i.product_id);
          
          const { data: recommendedProducts } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
            .limit(8);

          if (recommendedProducts) {
            setProducts(recommendedProducts);
          }
        } else {
          // If no interactions, show recent products
          const { data: recentProducts } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8);

          if (recentProducts) {
            setProducts(recentProducts);
          }
        }
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar recomendaciones');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  return {
    products,
    loading,
    error
  };
}