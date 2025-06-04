import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/webp', 'image/png']; // Agregado soporte para PNG
const BUCKET_NAME = 'products';

export const validateImage = (file: File): string | null => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Solo se permiten archivos JPG, PNG y WebP';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'El tamaño máximo permitido es 10MB';
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

    // Verificar si el bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === BUCKET_NAME)) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
        fileSizeLimit: MAX_FILE_SIZE
      });
      if (createError) throw createError;
    }

    // Convertir a WebP si es necesario
    let uploadFile = file;
    if (file.type !== 'image/webp') {
      try {
        const img = new Image();
        const blob = await new Promise<Blob>((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((b) => resolve(b!), 'image/webp', 0.9);
          };
          img.src = URL.createObjectURL(file);
        });
        uploadFile = new File([blob], `${file.name}.webp`, { type: 'image/webp' });
      } catch (err) {
        console.warn('Error al convertir a WebP, subiendo imagen original:', err);
      }
    }

    const fileExt = uploadFile.type === 'image/webp' ? 'webp' : 
                    uploadFile.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;

    // Subir el archivo
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, uploadFile, {
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