import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/product';
import Header from '../components/Header';
import ImageSlider from '../components/ImageSlider';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setProduct(data);
    } catch (err) {
      setError('Error al cargar el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Imágenes del producto */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                <div className="aspect-square rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
                  <ImageSlider images={product.images} />
                </div>
              </div>

              {/* Información del producto */}
              <div className="p-8 lg:p-12 space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{product.name}</h1>
                  <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl transform transition-transform duration-300 hover:scale-105">
                    <p className="text-sm font-medium text-primary-600">Material</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">
                      {product.material.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl transform transition-transform duration-300 hover:scale-105">
                    <p className="text-sm font-medium text-primary-600">Dimensiones</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">
                      {product.width} x {product.height} cm
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Precio unitario</p>
                      <p className="text-4xl font-bold text-primary mt-1">
                        MXN ${product.unit_price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500">Precio mayoreo</p>
                      <p className="text-3xl font-semibold text-gray-900 mt-1">
                        MXN ${product.bulk_price}
                      </p>
                    </div>
                  </div>
                </div>

                {product.keywords && product.keywords.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-500">Etiquetas</p>
                    <div className="flex flex-wrap gap-3">
                      {product.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 transform transition-transform duration-300 hover:scale-105"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 