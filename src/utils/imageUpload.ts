import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/webp'];
const BUCKET_NAME = 'products';

export const validateImage = (file: File): string | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Solo se permiten archivos JPG y WebP';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'El tamaño máximo permitido es 5MB';
  }

  return null;
};

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const validationError = validateImage(file);
    if (validationError) {
      alert(validationError);
      return null;
    }

    const fileExt = file.type === 'image/jpeg' ? 'jpg' : 'webp';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName;

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error al subir imagen:', error);
    alert('Error al subir la imagen. Por favor, intenta de nuevo.');
    return null;
  }
};

export const deleteImage = async (url: string): Promise<boolean> => {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    alert('Error al eliminar la imagen. Por favor, intenta de nuevo.');
    return false;
  }
};