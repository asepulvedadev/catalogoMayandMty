/*
  # Implementación de sistema de análisis de usuarios

  1. Nuevas Tablas
    - user_preferences: Almacena preferencias y perfiles de usuario
    - product_interactions: Registro detallado de interacciones
    - product_scores: Puntuaciones ML para productos
    
  2. Funciones
    - calculate_user_profile: Genera perfil de usuario basado en interacciones
    - update_product_scores: Actualiza scores de productos
    
  3. Triggers
    - auto_update_user_profile: Actualiza perfil al registrar interacciones
    - auto_update_product_scores: Actualiza scores periódicamente
*/

-- Tabla para almacenar preferencias y perfiles de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  preferences jsonb DEFAULT '{}'::jsonb,
  interaction_history jsonb[] DEFAULT ARRAY[]::jsonb[],
  ml_features float[] DEFAULT ARRAY[]::float[],
  last_updated timestamptz DEFAULT now()
);

-- Tabla para tracking detallado de interacciones
CREATE TABLE IF NOT EXISTS product_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  product_id uuid REFERENCES products(id),
  interaction_type text NOT NULL,
  duration_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CHECK (interaction_type IN ('view', 'click', 'cart', 'purchase', 'favorite'))
);

-- Tabla para scores de productos
CREATE TABLE IF NOT EXISTS product_scores (
  product_id uuid PRIMARY KEY REFERENCES products(id),
  relevance_score float DEFAULT 0,
  trending_score float DEFAULT 0,
  category_scores jsonb DEFAULT '{}'::jsonb,
  last_updated timestamptz DEFAULT now(),
  CHECK (relevance_score BETWEEN 0 AND 1),
  CHECK (trending_score BETWEEN 0 AND 1)
);

-- Función para calcular el perfil del usuario
CREATE OR REPLACE FUNCTION calculate_user_profile(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile jsonb;
BEGIN
  WITH user_stats AS (
    SELECT 
      pi.product_id,
      p.category,
      p.material,
      p.unit_price,
      COUNT(*) as interaction_count,
      MAX(pi.created_at) as last_interaction
    FROM product_interactions pi
    JOIN products p ON p.id = pi.product_id
    WHERE pi.user_id = calculate_user_profile.user_id
    GROUP BY pi.product_id, p.category, p.material, p.unit_price
  )
  SELECT 
    jsonb_build_object(
      'categories', (
        SELECT jsonb_object_agg(category, count)
        FROM (
          SELECT category, COUNT(*) as count
          FROM user_stats
          GROUP BY category
          ORDER BY count DESC
          LIMIT 5
        ) t
      ),
      'materials', (
        SELECT jsonb_object_agg(material, count)
        FROM (
          SELECT material, COUNT(*) as count
          FROM user_stats
          GROUP BY material
          ORDER BY count DESC
          LIMIT 3
        ) t
      ),
      'price_range', jsonb_build_object(
        'min', MIN(unit_price),
        'max', MAX(unit_price),
        'avg', AVG(unit_price)
      ),
      'interaction_patterns', jsonb_build_object(
        'total_interactions', COUNT(*),
        'unique_products', COUNT(DISTINCT product_id),
        'last_interaction', MAX(last_interaction)
      )
    )
  INTO profile
  FROM user_stats;

  RETURN COALESCE(profile, '{}'::jsonb);
END;
$$;

-- Función para actualizar scores de productos
CREATE OR REPLACE FUNCTION update_product_scores(product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  interaction_weight float := 0.3;
  time_decay_factor float := 0.1;
  base_score float := 0.5;
BEGIN
  -- Calcular score basado en interacciones recientes y patrones de usuario
  WITH product_stats AS (
    SELECT 
      COUNT(*) as total_interactions,
      COUNT(DISTINCT user_id) as unique_users,
      MAX(created_at) as last_interaction,
      SUM(CASE WHEN interaction_type = 'purchase' THEN 2
               WHEN interaction_type = 'cart' THEN 1.5
               WHEN interaction_type = 'click' THEN 1
               ELSE 0.5 END) as weighted_interactions
    FROM product_interactions
    WHERE product_id = update_product_scores.product_id
    AND created_at > now() - interval '30 days'
    GROUP BY product_id
  )
  UPDATE product_scores
  SET 
    relevance_score = LEAST(1.0, GREATEST(0.0,
      base_score +
      (COALESCE(ps.weighted_interactions, 0) * interaction_weight) / 100.0 +
      (EXTRACT(EPOCH FROM (COALESCE(ps.last_interaction, now()) - now())) * time_decay_factor) / (24*60*60)
    )),
    trending_score = LEAST(1.0, GREATEST(0.0,
      (COALESCE(ps.total_interactions, 0) * 0.4 +
       COALESCE(ps.unique_users, 0) * 0.6) / 100.0
    )),
    last_updated = now()
  FROM product_stats ps
  WHERE product_scores.product_id = update_product_scores.product_id;
END;
$$;

-- Trigger para actualizar perfil de usuario
CREATE OR REPLACE FUNCTION trigger_update_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar preferencias
  INSERT INTO user_preferences (user_id, preferences)
  VALUES (NEW.user_id, calculate_user_profile(NEW.user_id))
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    preferences = calculate_user_profile(NEW.user_id),
    last_updated = now();
    
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER auto_update_user_profile
AFTER INSERT OR UPDATE ON product_interactions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_user_profile();

-- Trigger para actualizar scores de productos
CREATE OR REPLACE FUNCTION trigger_update_product_scores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM update_product_scores(NEW.product_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER auto_update_product_scores
AFTER INSERT OR UPDATE ON product_interactions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_product_scores();

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_product_interactions_user_product 
ON product_interactions(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_product_interactions_created_at 
ON product_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_product_scores_relevance 
ON product_scores(relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_product_scores_trending 
ON product_scores(trending_score DESC);

-- Políticas de seguridad
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_scores ENABLE ROW LEVEL SECURITY;

-- Políticas para user_preferences
CREATE POLICY "Users can read their own preferences"
ON user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para product_interactions
CREATE POLICY "Users can insert their own interactions"
ON product_interactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own interactions"
ON product_interactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para product_scores
CREATE POLICY "Everyone can read product scores"
ON product_scores FOR SELECT
TO authenticated
USING (true);