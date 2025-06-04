import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Required environment variables are not set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client if API key is available
const openaiKey = Deno.env.get('OPENAI_API_KEY');
const openai = openaiKey ? new OpenAIApi(new Configuration({ apiKey: openaiKey })) : null;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Parse and validate request body
    const { userId } = await req.json();
    if (!userId) {
      throw new Error('userId is required');
    }

    // Get user interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select(`
        action,
        duration_seconds,
        timestamp,
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
      .limit(50);

    if (interactionsError) {
      throw new Error(`Failed to fetch interactions: ${interactionsError.message}`);
    }

    // Generate basic analysis if no OpenAI or not enough data
    if (!openai || !interactions?.length) {
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
          explanation: "No hay suficientes datos para generar recomendaciones personalizadas."
        }
      };

      // Update user profile with basic analysis
      await supabase.from('user_profiles').upsert({
        user_id: userId,
        preferences: basicAnalysis.preferences,
        ml_features: basicAnalysis.ml_features,
        last_updated: new Date().toISOString()
      });

      return new Response(
        JSON.stringify(basicAnalysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for OpenAI analysis
    const userBehavior = interactions.map(i => ({
      action: i.action,
      duration: i.duration_seconds,
      product: i.products,
      timestamp: i.timestamp
    }));

    // Generate OpenAI analysis
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Analiza estas ${interactions.length} interacciones de usuario:
          ${JSON.stringify(userBehavior, null, 2)}
          
          Genera un perfil detallado y recomendaciones en formato JSON:
          {
            "preferences": {
              "categories": ["3 categorías preferidas"],
              "materials": ["materiales preferidos"],
              "price_range": [min, max],
              "interests": ["palabras clave"]
            },
            "ml_features": [10 valores 0-1],
            "recommendations": {
              "categories": ["categorías sugeridas"],
              "products": ["productos sugeridos"],
              "explanation": "explicación en español"
            }
          }
          
          Notas:
          - Usa solo categorías y materiales existentes
          - Precios realistas basados en interacciones
          - Keywords relevantes para búsquedas
          - ml_features: precio(2), tamaño(2), complejidad(2), estilo(2), uso(2)`
      }],
      temperature: 0.3,
      max_tokens: 1000
    });

    const analysis = JSON.parse(completion.data.choices[0].message.content);

    // Update user profile
    await supabase.from('user_profiles').upsert({
      user_id: userId,
      preferences: analysis.preferences,
      ml_features: analysis.ml_features,
      last_updated: new Date().toISOString()
    });

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-user function:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 500
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});