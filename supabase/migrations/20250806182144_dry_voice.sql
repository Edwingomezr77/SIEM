/*
  # Corregir políticas RLS recursivas en user_profiles

  1. Problema
    - Las políticas actuales causan recursión infinita
    - La política de admin intenta consultar user_profiles dentro de user_profiles
  
  2. Solución
    - Eliminar políticas problemáticas
    - Crear políticas simples y directas
    - Evitar consultas recursivas a la misma tabla
  
  3. Nuevas Políticas
    - Los usuarios pueden leer su propio perfil
    - Los usuarios pueden actualizar su propio perfil
    - Sin políticas complejas que causen recursión
*/

-- Eliminar todas las políticas existentes que causan recursión
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Crear políticas simples y seguras
CREATE POLICY "Enable read access for users based on user_id"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);