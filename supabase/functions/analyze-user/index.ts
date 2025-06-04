import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface RequestBody {
  userId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { userId } = await req.json() as RequestBody

    // Get user interactions
    const { data: interactions } = await supabaseClient
      .from('user_interactions')
      .select('action, product_id, duration_seconds')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50)

    // Get product details for interacted products
    const productIds = [...new Set(interactions?.map(i => i.product_id) || [])]
    const { data: products } = await supabaseClient
      .from('products')
      .select('id, category, material, unit_price, keywords')
      .in('id', productIds)

    // Simple analysis of user preferences
    const preferences = {
      categories: [] as string[],
      materials: [] as string[],
      price_range: [0, 1000] as [number, number],
      interests: [] as string[],
    }

    if (products) {
      // Analyze categories and materials
      const categoryCount: Record<string, number> = {}
      const materialCount: Record<string, number> = {}
      let totalPrice = 0

      products.forEach(product => {
        if (product.category) {
          categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
        }
        if (product.material) {
          materialCount[product.material] = (materialCount[product.material] || 0) + 1
        }
        if (product.unit_price) {
          totalPrice += Number(product.unit_price)
        }
        if (product.keywords) {
          preferences.interests.push(...product.keywords)
        }
      })

      // Get top categories and materials
      preferences.categories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category)

      preferences.materials = Object.entries(materialCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([material]) => material)

      // Calculate price range
      const avgPrice = totalPrice / products.length
      preferences.price_range = [
        Math.max(0, avgPrice * 0.5),
        avgPrice * 1.5
      ]

      // Clean and deduplicate interests
      preferences.interests = [...new Set(preferences.interests)].slice(0, 10)
    }

    // Generate simple ML features (placeholder)
    const ml_features = [
      preferences.categories.length,
      preferences.materials.length,
      preferences.price_range[1] - preferences.price_range[0],
      preferences.interests.length,
    ]

    // Generate recommendations
    const recommendations = {
      categories: preferences.categories,
      products: preferences.interests,
      explanation: `Based on your interaction history, we recommend products in ${preferences.categories.join(', ')} categories, made from ${preferences.materials.join(', ')}.`
    }

    // Update user profile
    await supabaseClient
      .from('user_profiles')
      .upsert({
        user_id: userId,
        preferences,
        ml_features,
        last_updated: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        preferences,
        ml_features,
        recommendations
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    )
  }
})