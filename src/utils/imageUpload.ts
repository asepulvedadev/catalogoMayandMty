import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/webp', 'image/png', 'image/jpg'];
const BUCKET_NAME = 'products';

export const validateImage = (file: File): string | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Solo se permiten archivos JPG, PNG y WebP';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'El tamaño máximo permitido es 15MB';
  }

  return null;
};

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const validationError = validateImage(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Procesar la imagen antes de subirla
    let processedFile = file;
    try {
      // Crear un elemento de imagen para procesar
      const img = new Image();
      const imgUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      // Crear canvas para el procesamiento
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Redimensionar si la imagen es muy grande
      const MAX_DIMENSION = 2048;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Dibujar la imagen con la nueva dimensión
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/webp', 0.85);
        });

        processedFile = new File([blob], `${file.name}.webp`, { type: 'image/webp' });
      }

      // Limpiar
      URL.revokeObjectURL(imgUrl);
    } catch (err) {
      console.warn('Error al procesar la imagen:', err);
      // Continuar con el archivo original si hay error en el procesamiento
    }

    const fileExt = processedFile.type === 'image/webp' ? 'webp' : 
                    processedFile.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;

    // Subir el archivo
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, processedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error al subir la imagen');
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
    throw new Error('Error al eliminar la imagen');
  }
};