-- Sistema de Permisos Basados en Roles
-- 
-- 1. Roles Disponibles:
--    - admin: Permisos completos (crear, editar, eliminar)
--    - editor: Puede crear y editar, pero NO eliminar
--    - viewer: Solo puede ver, sin modificaciones
--
-- 2. Función auxiliar para obtener el rol del usuario actual
-- 3. Actualizar políticas de todas las tablas según roles

-- Función auxiliar para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Actualizar políticas de remisiones basadas en roles
DROP POLICY IF EXISTS "Permitir acceso público a remisiones" ON remisiones;

CREATE POLICY "Usuarios autenticados pueden ver remisiones"
  ON remisiones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios anónimos pueden ver remisiones"
  ON remisiones
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins y editores pueden crear remisiones"
  ON remisiones
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admins y editores pueden actualizar remisiones"
  ON remisiones
  FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Solo admins pueden eliminar remisiones"
  ON remisiones
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- Actualizar políticas de piezas_embarcadas basadas en roles
DROP POLICY IF EXISTS "Permitir acceso público a piezas embarcadas" ON piezas_embarcadas;

CREATE POLICY "Usuarios autenticados pueden ver piezas"
  ON piezas_embarcadas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios anónimos pueden ver piezas"
  ON piezas_embarcadas
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins y editores pueden crear piezas"
  ON piezas_embarcadas
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admins y editores pueden actualizar piezas"
  ON piezas_embarcadas
  FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Solo admins pueden eliminar piezas"
  ON piezas_embarcadas
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- Actualizar políticas de preembarque_info basadas en roles
DROP POLICY IF EXISTS "Permitir acceso público a preembarque info" ON preembarque_info;

CREATE POLICY "Usuarios autenticados pueden ver preembarque info"
  ON preembarque_info
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios anónimos pueden ver preembarque info"
  ON preembarque_info
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins y editores pueden crear preembarque info"
  ON preembarque_info
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admins y editores pueden actualizar preembarque info"
  ON preembarque_info
  FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'editor'));

-- Actualizar políticas de remision_images basadas en roles
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes" ON remision_images;
DROP POLICY IF EXISTS "Permitir gestión de imágenes a usuarios autenticados" ON remision_images;

CREATE POLICY "Usuarios autenticados pueden ver imágenes"
  ON remision_images
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios anónimos pueden ver imágenes"
  ON remision_images
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins y editores pueden subir imágenes"
  ON remision_images
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Solo admins pueden eliminar imágenes"
  ON remision_images
  FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- Actualizar políticas de storage basadas en roles
DROP POLICY IF EXISTS "Permitir subida de imágenes a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de imágenes a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de imágenes a usuarios autenticados" ON storage.objects;

CREATE POLICY "Admins y editores pueden subir imágenes al storage"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'remision-images' AND
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Admins y editores pueden actualizar imágenes en storage"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'remision-images' AND
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Solo admins pueden eliminar imágenes del storage"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'remision-images' AND
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) = 'admin'
  );
