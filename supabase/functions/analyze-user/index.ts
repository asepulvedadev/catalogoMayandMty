import { createClient } from '@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RequestBody {
  userId: string;
}

// Validate environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set');
}

// Initialize Supabase client outside the handler
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get request body
    const { userId } = await req.json() as RequestBody;

    if (!userId) {
      throw new Error('userId is required');
    }

    // Get user interactions
    const { data: interactions, error: interactionsError } = await supabaseClient
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (interactionsError) {
      throw new Error(`Failed to fetch user interactions: ${interactionsError.message}`);
    }

    if (!interactions || interactions.length === 0) {
      // Return default recommendations if no interactions
      return new Response(
        JSON.stringify({
          preferences: {
            categories: ['office_supplies', 'geometric_shapes'],
            materials: ['mdf', 'acrilico'],
            price_range: [0, 1000],
            interests: ['design', 'office'],
          },
          ml_features: [0.5, 0.5, 0.5, 0.5],
          recommendations: {
            categories: ['office_supplies', 'geometric_shapes'],
            products: ['office', 'geometric', 'design'],
            explanation: 'Recomendaciones basadas en productos populares',
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get products user interacted with
    const productIds = [...new Set(interactions.map(i => i.product_id))];
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    // Analyze user preferences
    const categories = products?.reduce((acc, p) => {
      if (p.category) acc.add(p.category);
      return acc;
    }, new Set<string>());

    const materials = products?.reduce((acc, p) => {
      if (p.material) acc.add(p.material);
      return acc;
    }, new Set<string>());

    const prices = products?.map(p => Number(p.unit_price)) || [];
    const minPrice = Math.min(...prices, 0);
    const maxPrice = Math.max(...prices, 1000);

    // Generate recommendations
    const response = {
      preferences: {
        categories: Array.from(categories || []),
        materials: Array.from(materials || []),
        price_range: [minPrice, maxPrice],
        interests: ['design', 'office'],
      },
      ml_features: [0.5, 0.5, 0.5, 0.5], // Simplified ML features
      recommendations: {
        categories: Array.from(categories || []).slice(0, 3),
        products: products?.slice(0, 5).map(p => p.name) || [],
        explanation: 'Recomendaciones basadas en tus interacciones recientes',
      },
    };

    // Update user profile
    const { error: updateError } = await supabaseClient
      .from('user_profiles')
      .upsert({
        user_id: userId,
        preferences: response,
        ml_features: response.ml_features,
        last_updated: new Date().toISOString(),
      });

    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'If this error persists, please ensure SUPABASE_URL and SUPABASE_ANON_KEY are properly configured.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});