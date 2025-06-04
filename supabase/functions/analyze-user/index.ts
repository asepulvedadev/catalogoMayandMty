import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize clients outside request handler
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openaiKey = Deno.env.get('OPENAI_API_KEY');

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Only initialize OpenAI if key is present
let openai: OpenAIApi | null = null;
if (openaiKey) {
  openai = new OpenAIApi(new Configuration({
    apiKey: openaiKey,
  }));
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select(`
        *,
        products (
          name,
          description,
          category,
          material,
          unit_price,
          keywords
        )
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (interactionsError) {
      throw new Error(`Failed to fetch interactions: ${interactionsError.message}`);
    }

    if (!interactions?.length) {
      throw new Error('No hay suficientes interacciones para analizar');
    }

    // If OpenAI is not configured, return basic analysis
    if (!openai) {
      const basicAnalysis = {
        preferences: {
          categories: [],
          materials: [],
          price_range: [0, 0],
          interests: []
        },
        ml_features: Array(10).fill(0.5),
        recommendations: {
          categories: [],
          products: [],
          explanation: "Análisis no disponible - OpenAI no está configurado"
        }
      };

      await supabase.from('user_profiles').upsert({
        user_id: userId,
        preferences: basicAnalysis.preferences,
        ml_features: basicAnalysis.ml_features,
        last_updated: new Date().toISOString(),
      });

      return new Response(JSON.stringify(basicAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare data for OpenAI
    const userBehavior = interactions.map(i => ({
      action: i.action,
      duration: i.duration_seconds,
      product: i.products,
      timestamp: i.timestamp,
    }));

    // OpenAI prompt
    const prompt = `
    Analiza el comportamiento de este usuario basado en sus ${interactions.length} interacciones:
    ${JSON.stringify(userBehavior, null, 2)}

    Genera un perfil detallado del usuario y recomendaciones en formato JSON con:
    {
      "preferences": {
        "categories": ["top 3 categorías preferidas"],
        "materials": ["materiales preferidos"],
        "price_range": [precio mínimo, precio máximo],
        "interests": ["palabras clave de interés"]
      },
      "ml_features": [10 números entre 0-1 representando afinidad con diferentes aspectos],
      "recommendations": {
        "categories": ["categorías recomendadas"],
        "products": ["tipos de productos sugeridos"],
        "explanation": "explicación en español de las recomendaciones"
      }
    }

    Asegúrate de que:
    1. Las categorías y materiales existan en el sistema
    2. Los precios sean realistas basados en las interacciones
    3. Las palabras clave sean relevantes para búsquedas futuras
    4. Los ml_features representen: precio (2), tamaño (2), complejidad (2), estilo (2), uso (2)
    `;

    // Call OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const analysis = JSON.parse(completion.data.choices[0].message.content);

    // Update user profile
    const { error: updateError } = await supabase.from('user_profiles').upsert({
      user_id: userId,
      preferences: analysis.preferences,
      ml_features: analysis.ml_features,
      last_updated: new Date().toISOString(),
    });

    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});