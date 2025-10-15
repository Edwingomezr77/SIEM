/*
  # Corregir políticas RLS para acceso público

  1. Políticas actualizadas
    - Permitir acceso público (anon) a todas las operaciones
    - Mantener también acceso para usuarios autenticados
  
  2. Tablas afectadas
    - `remisiones` - Permitir CRUD público
    - `piezas_embarcadas` - Permitir CRUD público
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver todas las remisiones" ON remisiones;
DROP POLICY IF EXISTS "Usuarios pueden crear remisiones" ON remisiones;
DROP POLICY IF EXISTS "Usuarios pueden actualizar remisiones" ON remisiones;
DROP POLICY IF EXISTS "Usuarios pueden eliminar remisiones" ON remisiones;

DROP POLICY IF EXISTS "Usuarios pueden ver todas las piezas" ON piezas_embarcadas;
DROP POLICY IF EXISTS "Usuarios pueden crear piezas" ON piezas_embarcadas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar piezas" ON piezas_embarcadas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar piezas" ON piezas_embarcadas;

-- Crear nuevas políticas que permitan acceso público
CREATE POLICY "Permitir acceso público a remisiones"
  ON remisiones
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir acceso público a piezas embarcadas"
  ON piezas_embarcadas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);