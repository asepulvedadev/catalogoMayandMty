/*
  # Mejora de políticas RLS para todas las tablas

  1. Cambios Generales
    - Habilita RLS en todas las tablas
    - Establece políticas específicas por rol
    - Implementa políticas granulares por operación

  2. Políticas por Tabla
    - products: Lectura pública, escritura autenticada
    - user_interactions: Solo acceso a datos propios
    - user_profiles: Solo acceso a perfil propio
    - trending_products: Lectura pública
    - user_preferences: Solo acceso a preferencias propias
    - product_interactions: Solo acceso a interacciones propias
    - product_scores: Lectura pública
*/

-- Función auxiliar para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS uuid 
LANGUAGE sql 
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    (current_setting('request.jwt.claims', true)::jsonb->>'sub')
  )::uuid
$$;

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos visibles públicamente"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear productos"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar productos"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar productos"
ON products FOR DELETE
TO authenticated
USING (true);

-- User Interactions
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias interacciones"
ON user_interactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias interacciones"
ON user_interactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio perfil"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su propio perfil"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trending Products
ALTER TABLE trending_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos tendencia visibles públicamente"
ON trending_products FOR SELECT
TO public
USING (true);

-- User Preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias preferencias"
ON user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias preferencias"
ON user_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias preferencias"
ON user_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Product Interactions
ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias interacciones con productos"
ON product_interactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propias interacciones con productos"
ON product_interactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Product Scores
ALTER TABLE product_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Puntuaciones de productos visibles públicamente"
ON product_scores FOR SELECT
TO authenticated
USING (true);