import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RequestBody {
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { userId }: RequestBody = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    // Get user interactions
    const { data: interactions } = await supabaseClient
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (!interactions?.length) {
      // Return default recommendations if no interactions
      return new Response(
        JSON.stringify({
          preferences: {
            categories: ['office_supplies', 'geometric_shapes'],
            materials: ['mdf', 'acrilico'],
            price_range: [0, 1000],
            interests: ['basic'],
          },
          ml_features: [0.5, 0.5, 0.5, 0.5, 0.5],
          recommendations: {
            categories: ['office_supplies', 'geometric_shapes'],
            products: ['basic', 'popular'],
            explanation: 'Recomendaciones basadas en productos populares',
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get product details for interacted products
    const productIds = [...new Set(interactions.map(i => i.product_id))];
    const { data: products } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', productIds);

    // Calculate preferences
    const categories = products?.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = 0;
      acc[p.category]++;
      return acc;
    }, {} as Record<string, number>) ?? {};

    const materials = products?.reduce((acc, p) => {
      if (!acc[p.material]) acc[p.material] = 0;
      acc[p.material]++;
      return acc;
    }, {} as Record<string, number>) ?? {};

    // Get top categories and materials
    const topCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);

    const topMaterials = Object.entries(materials)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([mat]) => mat);

    // Calculate price range
    const prices = products?.map(p => Number(p.unit_price)) ?? [];
    const minPrice = Math.min(...prices, 0);
    const maxPrice = Math.max(...prices, 1000);

    // Generate simple ML features (placeholder)
    const mlFeatures = [
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random(),
    ];

    const response = {
      preferences: {
        categories: topCategories,
        materials: topMaterials,
        price_range: [minPrice, maxPrice],
        interests: ['personalized'],
      },
      ml_features: mlFeatures,
      recommendations: {
        categories: topCategories,
        products: productIds,
        explanation: 'Recomendaciones basadas en tus interacciones previas',
      },
    };

    // Update user profile
    await supabaseClient
      .from('user_profiles')
      .upsert({
        user_id: userId,
        preferences: response.preferences,
        ml_features: response.ml_features,
        last_updated: new Date().toISOString(),
      });

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
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