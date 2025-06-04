import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RequestParams {
  userId?: string;
  limit?: number;
  offset?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const url = new URL(req.url);
    const params: RequestParams = {
      userId: url.searchParams.get('userId') ?? undefined,
      limit: parseInt(url.searchParams.get('limit') ?? '10'),
      offset: parseInt(url.searchParams.get('offset') ?? '0'),
    };

    // Si tenemos un userId, obtenemos sus preferencias
    let userPreferences = null;
    if (params.userId) {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', params.userId)
        .single();
      
      userPreferences = preferences?.preferences;
    }

    // Consulta base para productos con scores
    let query = supabase
      .from('products')
      .select(`
        *,
        product_scores (
          relevance_score,
          trending_score
        )
      `)
      .order('created_at', { ascending: false });

    // Si tenemos preferencias de usuario, aplicamos filtros personalizados
    if (userPreferences) {
      const topCategories = Object.keys(userPreferences.categories || {});
      const topMaterials = Object.keys(userPreferences.materials || {});
      
      if (topCategories.length > 0) {
        query = query.in('category', topCategories);
      }
      
      if (topMaterials.length > 0) {
        query = query.in('material', topMaterials);
      }

      // Aplicar rango de precios si existe
      if (userPreferences.price_range) {
        const { min, max } = userPreferences.price_range;
        if (min !== null) query = query.gte('unit_price', min);
        if (max !== null) query = query.lte('unit_price', max);
      }
    }

    // Aplicar límite y offset
    query = query
      .limit(params.limit)
      .range(params.offset, params.offset + params.limit - 1);

    const { data: products, error } = await query;

    if (error) throw error;

    // Ordenar productos por score
    const sortedProducts = products
      .map(product => ({
        ...product,
        score: (
          (product.product_scores?.relevance_score || 0) * 0.7 +
          (product.product_scores?.trending_score || 0) * 0.3
        )
      }))
      .sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify({
        products: sortedProducts,
        hasMore: products.length === params.limit,
        preferences: userPreferences,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});