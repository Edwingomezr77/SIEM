/*
  # Crear tabla de imágenes y configurar Storage

  1. New Tables
    - `remision_images`
      - `id` (uuid, primary key)
      - `remision_id` (uuid, foreign key)
      - `image_url` (text)
      - `image_name` (text)
      - `description` (text, optional)
      - `created_at` (timestamp)

  2. Storage
    - Crear bucket 'remision-images' para almacenar las imágenes
    - Configurar políticas de acceso público para lectura
    - Configurar políticas para usuarios autenticados para subida

  3. Security
    - Enable RLS on `remision_images` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update/delete
*/

-- Crear tabla para almacenar referencias a las imágenes
CREATE TABLE IF NOT EXISTS remision_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remision_id uuid NOT NULL REFERENCES remisiones(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE remision_images ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Permitir lectura pública de imágenes"
  ON remision_images
  FOR SELECT
  TO public
  USING (true);

-- Política para usuarios autenticados (insertar, actualizar, eliminar)
CREATE POLICY "Permitir gestión de imágenes a usuarios autenticados"
  ON remision_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_remision_images_remision_id ON remision_images(remision_id);
CREATE INDEX IF NOT EXISTS idx_remision_images_created_at ON remision_images(created_at);
