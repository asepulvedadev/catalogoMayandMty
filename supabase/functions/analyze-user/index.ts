import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    // Inicializar clientes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }));

    // Obtener interacciones del usuario
    const { data: interactions } = await supabase
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

    if (!interactions?.length) {
      throw new Error('No hay suficientes interacciones para analizar');
    }

    // Preparar datos para OpenAI
    const userBehavior = interactions.map(i => ({
      action: i.action,
      duration: i.duration_seconds,
      product: i.products,
      timestamp: i.timestamp,
    }));

    // Prompt para OpenAI
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

    // Llamar a OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const analysis = JSON.parse(completion.data.choices[0].message.content);

    // Actualizar perfil del usuario
    await supabase.from('user_profiles').upsert({
      user_id: userId,
      preferences: analysis.preferences,
      ml_features: analysis.ml_features,
      last_updated: new Date().toISOString(),
    });

    return new Response(JSON.stringify(analysis), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});