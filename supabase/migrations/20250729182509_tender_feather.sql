/*
  # Esquema para Sistema de Remisiones y Piezas Embarcadas

  1. Nuevas Tablas
    - `remisiones`
      - `id` (uuid, primary key)
      - `numero_remision` (text, unique) - Número único de la remisión
      - `cliente` (text) - Nombre del cliente
      - `fecha_creacion` (timestamp) - Fecha de creación
      - `fecha_embarque` (timestamp) - Fecha de embarque
      - `estado` (text) - Estado de la remisión (pendiente, embarcada, entregada)
      - `observaciones` (text) - Observaciones adicionales
      - `total_piezas` (integer) - Total de piezas en la remisión
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `piezas_embarcadas`
      - `id` (uuid, primary key)
      - `remision_id` (uuid, foreign key) - Referencia a la remisión
      - `marca` (text) - Marca de la pieza
      - `cantidad` (integer) - Cantidad de piezas
      - `timestamp_registro` (timestamp) - Momento del registro
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas para usuarios autenticados
    - Trigger para actualizar total_piezas automáticamente

  3. Índices
    - Índice en numero_remision para búsquedas rápidas
    - Índice en remision_id para consultas de piezas
*/

-- Crear tabla de remisiones
CREATE TABLE IF NOT EXISTS remisiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_remision text UNIQUE NOT NULL,
  cliente text NOT NULL DEFAULT '',
  fecha_creacion timestamptz DEFAULT now(),
  fecha_embarque timestamptz,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'embarcada', 'entregada')),
  observaciones text DEFAULT '',
  total_piezas integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de piezas embarcadas
CREATE TABLE IF NOT EXISTS piezas_embarcadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remision_id uuid NOT NULL REFERENCES remisiones(id) ON DELETE CASCADE,
  marca text NOT NULL,
  cantidad integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  timestamp_registro timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE remisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE piezas_embarcadas ENABLE ROW LEVEL SECURITY;

-- Políticas para remisiones
CREATE POLICY "Usuarios pueden ver todas las remisiones"
  ON remisiones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear remisiones"
  ON remisiones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar remisiones"
  ON remisiones
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden eliminar remisiones"
  ON remisiones
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para piezas embarcadas
CREATE POLICY "Usuarios pueden ver todas las piezas"
  ON piezas_embarcadas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear piezas"
  ON piezas_embarcadas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar piezas"
  ON piezas_embarcadas
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden eliminar piezas"
  ON piezas_embarcadas
  FOR DELETE
  TO authenticated
  USING (true);

-- Función para actualizar el total de piezas en la remisión
CREATE OR REPLACE FUNCTION actualizar_total_piezas()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE remisiones 
    SET total_piezas = (
      SELECT COALESCE(SUM(cantidad), 0) 
      FROM piezas_embarcadas 
      WHERE remision_id = NEW.remision_id
    ),
    updated_at = now()
    WHERE id = NEW.remision_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE remisiones 
    SET total_piezas = (
      SELECT COALESCE(SUM(cantidad), 0) 
      FROM piezas_embarcadas 
      WHERE remision_id = OLD.remision_id
    ),
    updated_at = now()
    WHERE id = OLD.remision_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente el total de piezas
DROP TRIGGER IF EXISTS trigger_actualizar_total_piezas ON piezas_embarcadas;
CREATE TRIGGER trigger_actualizar_total_piezas
  AFTER INSERT OR UPDATE OR DELETE ON piezas_embarcadas
  FOR EACH ROW EXECUTE FUNCTION actualizar_total_piezas();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en remisiones
DROP TRIGGER IF EXISTS trigger_updated_at_remisiones ON remisiones;
CREATE TRIGGER trigger_updated_at_remisiones
  BEFORE UPDATE ON remisiones
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_remisiones_numero ON remisiones(numero_remision);
CREATE INDEX IF NOT EXISTS idx_remisiones_estado ON remisiones(estado);
CREATE INDEX IF NOT EXISTS idx_remisiones_fecha_creacion ON remisiones(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_piezas_remision_id ON piezas_embarcadas(remision_id);
CREATE INDEX IF NOT EXISTS idx_piezas_marca ON piezas_embarcadas(marca);