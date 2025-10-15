/*
  # Agregar campo folio a piezas embarcadas

  1. Cambios
    - Agregar columna `folio` a la tabla `piezas_embarcadas`
    - El folio será único por pieza
    - Campo opcional (nullable)

  2. Índices
    - Agregar índice para búsquedas rápidas por folio
*/

-- Agregar columna folio a piezas_embarcadas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'piezas_embarcadas' AND column_name = 'folio'
  ) THEN
    ALTER TABLE piezas_embarcadas ADD COLUMN folio text;
  END IF;
END $$;

-- Crear índice para folio
CREATE INDEX IF NOT EXISTS idx_piezas_folio ON piezas_embarcadas (folio);
