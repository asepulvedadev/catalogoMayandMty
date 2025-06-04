import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Get user ID from request
    const { user_id } = await req.json();
    if (!user_id) {
      throw new Error("User ID is required");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get user interactions
    const { data: interactions, error: interactionsError } = await supabaseClient
      .from("user_interactions")
      .select("*")
      .eq("user_id", user_id);

    if (interactionsError) {
      throw interactionsError;
    }

    // Analyze user behavior and generate features
    const features = analyzeUserBehavior(interactions);

    // Update user profile with new features
    const { error: updateError } = await supabaseClient
      .from("user_profiles")
      .upsert({
        user_id,
        ml_features: features,
        last_updated: new Date().toISOString(),
      });

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, features }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});

function analyzeUserBehavior(interactions: any[]): number[] {
  // Initialize feature vector
  const features = new Array(10).fill(0);

  if (!interactions || interactions.length === 0) {
    return features;
  }

  // Calculate features based on interactions
  const viewCount = interactions.filter(i => i.action === "view").length;
  const clickCount = interactions.filter(i => i.action === "click").length;
  const cartCount = interactions.filter(i => i.action === "cart").length;
  const buyCount = interactions.filter(i => i.action === "buy").length;

  // Total interactions
  features[0] = interactions.length;
  
  // Action ratios
  features[1] = viewCount / interactions.length;
  features[2] = clickCount / interactions.length;
  features[3] = cartCount / interactions.length;
  features[4] = buyCount / interactions.length;

  // Average duration
  features[5] = interactions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / interactions.length;

  // Engagement score (weighted sum of actions)
  features[6] = (viewCount + clickCount * 2 + cartCount * 3 + buyCount * 4) / interactions.length;

  // Time-based features
  const timestamps = interactions.map(i => new Date(i.timestamp).getTime());
  const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
  features[7] = timeSpan / (1000 * 60 * 60 * 24); // Days of activity

  // Frequency
  features[8] = interactions.length / (timeSpan / (1000 * 60 * 60 * 24) || 1); // Actions per day

  // Recency
  const mostRecent = Math.max(...timestamps);
  const now = new Date().getTime();
  features[9] = (now - mostRecent) / (1000 * 60 * 60 * 24); // Days since last action

  return features;
}