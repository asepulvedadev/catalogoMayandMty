import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useTracking = () => {
  const trackView = useCallback(async (productId: string) => {
    const startTime = Date.now();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return () => {};

      await supabase.from('user_interactions').insert({
        user_id: user.id,
        product_id: productId,
        action: 'view',
        duration_seconds: 0
      });

      return () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        supabase.from('user_interactions')
          .update({ duration_seconds: duration })
          .eq('product_id', productId)
          .eq('action', 'view')
          .eq('user_id', user.id);
      };
    } catch (error) {
      console.error('Error tracking view:', error);
      return () => {};
    }
  }, []);

  const trackAction = useCallback(async (productId: string, action: 'click' | 'cart' | 'buy') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_interactions').insert({
        user_id: user.id,
        product_id: productId,
        action
      });
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  }, []);

  return { trackView, trackAction };
};