/*
  # Improve RLS policies for all tables

  1. Security Changes
    - Enable RLS on all tables
    - Add policies for public and authenticated access
    - Implement user-based security policies
  
  2. Policies Added
    - Products: Public viewing, authenticated modifications
    - User interactions: User-specific access
    - User profiles: User-specific access
    - Trending products: Public viewing
    - Product scores: Public viewing
    - User preferences: User-specific access
*/

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
USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden crear sus propias interacciones"
ON user_interactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio perfil"
ON user_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON user_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden crear su propio perfil"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

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
USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus propias preferencias"
ON user_preferences FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuarios pueden crear sus propias preferencias"
ON user_preferences FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Product Interactions
ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias interacciones con productos"
ON product_interactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden crear sus propias interacciones con productos"
ON product_interactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Product Scores
ALTER TABLE product_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Puntuaciones de productos visibles públicamente"
ON product_scores FOR SELECT
TO authenticated
USING (true);