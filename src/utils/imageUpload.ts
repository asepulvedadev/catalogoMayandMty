import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/webp'];

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
    const filePath = `product-images/${fileName}`;

    // Check if the bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'products')) {
      const { error: createError } = await supabase.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
        fileSizeLimit: MAX_FILE_SIZE
      });
      if (createError) throw createError;
    }

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const deleteImage = async (url: string): Promise<boolean> => {
  try {
    const path = url.split('/').pop();
    if (!path) return false;

    const { error } = await supabase.storage
      .from('products')
      .remove([`product-images/${path}`]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};