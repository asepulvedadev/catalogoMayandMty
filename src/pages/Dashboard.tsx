import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import type { Product, ProductFormState, Material, ProductCategory } from '../types/product';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

// ... (resto del código existente hasta el inicio del componente)

const Dashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductFormState>({
    name: '',
    description: null,
    material: 'mdf',
    width: 0,
    height: 0,
    unit_price: 0,
    bulk_price: 0,
    image_url: null,
    category: 'office_supplies',
    keywords: [],
    images: []
  });

  // ... (resto del código existente hasta handleSubmit)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (!currentProduct.images.length) {
        throw new Error('Debes agregar al menos una imagen al producto');
      }

      if (currentProduct.bulk_price > currentProduct.unit_price) {
        throw new Error('El precio por mayoreo no puede ser mayor al precio unitario');
      }

      if (isEditing && currentProduct.id) {
        const { id, ...updateData } = currentProduct;
        const { error: updateError } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;
        setSuccess('Producto actualizado exitosamente');
      } else {
        const { id, ...insertData } = currentProduct;
        const { error: insertError } = await supabase
          .from('products')
          .insert([insertData]);

        if (insertError) throw insertError;
        setSuccess('Producto creado exitosamente');
      }

      setIsEditing(false);
      setCurrentProduct({
        name: '',
        description: null,
        material: 'mdf',
        width: 0,
        height: 0,
        unit_price: 0,
        bulk_price: 0,
        image_url: null,
        category: 'office_supplies',
        keywords: [],
        images: []
      });
      setPage(0);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    }
  };

  // ... (resto del código existente hasta el return)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            {error && (
              <ErrorMessage
                title="Error al procesar el producto"
                message={error}
                onClose={() => setError(null)}
              />
            )}
            
            {success && (
              <SuccessMessage
                message={success}
                onClose={() => setSuccess(null)}
              />
            )}

            {/* Resto del contenido del formulario... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;