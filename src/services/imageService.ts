import { supabase } from '../lib/supabase';
import { RemisionImage } from '../types/database';

export class ImageService {
  private static BUCKET_NAME = 'remision-images';

  // Subir imagen
  static async uploadImage(
    remisionId: string, 
    file: File, 
    description?: string
  ): Promise<RemisionImage> {
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${remisionId}/${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // Guardar referencia en la base de datos
      const { data, error } = await supabase
        .from('remision_images')
        .insert({
          remision_id: remisionId,
          image_url: urlData.publicUrl,
          image_name: file.name,
          description: description || ''
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Obtener imágenes de una remisión
  static async getRemisionImages(remisionId: string): Promise<RemisionImage[]> {
    const { data, error } = await supabase
      .from('remision_images')
      .select('*')
      .eq('remision_id', remisionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Eliminar imagen
  static async deleteImage(imageId: string): Promise<void> {
    try {
      // Obtener información de la imagen
      const { data: imageData, error: fetchError } = await supabase
        .from('remision_images')
        .select('image_url')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Extraer el path del archivo de la URL
      const url = new URL(imageData.image_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // remision_id/filename

      // Eliminar archivo del storage
      const { error: deleteStorageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (deleteStorageError) {
        console.warn('Error deleting file from storage:', deleteStorageError);
      }

      // Eliminar referencia de la base de datos
      const { error: deleteDbError } = await supabase
        .from('remision_images')
        .delete()
        .eq('id', imageId);

      if (deleteDbError) throw deleteDbError;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // Actualizar descripción de imagen
  static async updateImageDescription(imageId: string, description: string): Promise<void> {
    const { error } = await supabase
      .from('remision_images')
      .update({ description })
      .eq('id', imageId);

    if (error) throw error;
  }
}