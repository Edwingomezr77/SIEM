/*
  # Agregar información adicional del pre-embarque

  1. New Tables
    - `preembarque_info`
      - `id` (uuid, primary key)
      - `remision_id` (uuid, foreign key to remisiones)
      - `supervisor_obra` (text)
      - `operador` (text)
      - `telefono` (text)
      - `placas_camion` (text)
      - `transportista` (text)
      - `barrotes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `preembarque_info` table
    - Add policy for public access to preembarque info

  3. Changes
    - Add trigger to update `updated_at` timestamp
*/

CREATE TABLE IF NOT EXISTS preembarque_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remision_id uuid NOT NULL REFERENCES remisiones(id) ON DELETE CASCADE,
  supervisor_obra text DEFAULT '',
  operador text DEFAULT '',
  telefono text DEFAULT '',
  placas_camion text DEFAULT '',
  transportista text DEFAULT '',
  barrotes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(remision_id)
);

ALTER TABLE preembarque_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a preembarque info"
  ON preembarque_info
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_updated_at_preembarque_info
  BEFORE UPDATE ON preembarque_info
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_preembarque_info_remision_id 
  ON preembarque_info(remision_id);
