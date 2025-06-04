/*
  # Sistema de Recomendaciones

  1. Nuevas Tablas
    - `user_interactions`: Registra interacciones de usuarios con productos
    - `user_profiles`: Almacena perfiles de usuario generados por IA
    - `trending_products`: Guarda productos tendencia y predicciones

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para lectura/escritura autenticada
*/

-- Tabla de interacciones de usuario
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  action TEXT CHECK (action IN ('view', 'click', 'cart', 'buy')),
  duration_seconds INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_duration CHECK (duration_seconds >= 0)
);

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  preferences JSONB,
  ml_features DECIMAL[],
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos trending
CREATE TABLE IF NOT EXISTS trending_products (
  product_id UUID PRIMARY KEY REFERENCES products(id),
  trend_score DECIMAL,
  ml_prediction DECIMAL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_scores CHECK (
    trend_score BETWEEN 0 AND 1 AND
    ml_prediction BETWEEN 0 AND 1
  )
);

-- Habilitar RLS
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read their own interactions"
  ON user_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can read trending products"
  ON trending_products
  FOR SELECT
  TO public
  USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS user_interactions_user_id_idx ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS user_interactions_product_id_idx ON user_interactions(product_id);
CREATE INDEX IF NOT EXISTS trending_products_score_idx ON trending_products(trend_score DESC);