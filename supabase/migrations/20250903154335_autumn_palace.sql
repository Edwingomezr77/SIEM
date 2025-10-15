/*
  # Configurar Storage para imágenes de remisiones

  1. Storage Bucket
    - Crear bucket 'remision-images' para almacenar las imágenes
    - Configurar como público para permitir acceso directo a las URLs

  2. Políticas de Storage
    - Permitir lectura pública de todas las imágenes
    - Permitir subida solo a usuarios autenticados
    - Permitir eliminación solo a usuarios autenticados

  3. Configuración
    - Tamaño máximo de archivo: 5MB
    - Tipos de archivo permitidos: image/*
*/

-- Crear bucket para imágenes de remisiones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'remision-images',
  'remision-images', 
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Permitir lectura pública de imágenes de remisiones"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'remision-images');

-- Política para permitir subida de imágenes a usuarios autenticados
CREATE POLICY "Permitir subida de imágenes a usuarios autenticados"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'remision-images');

-- Política para permitir actualización de imágenes a usuarios autenticados
CREATE POLICY "Permitir actualización de imágenes a usuarios autenticados"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'remision-images');

-- Política para permitir eliminación de imágenes a usuarios autenticados
CREATE POLICY "Permitir eliminación de imágenes a usuarios autenticados"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'remision-images');