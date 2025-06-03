import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ProductCategory } from '../types/product';
import logo from '../assets/logo_mayand.png';

const ITEMS_PER_PAGE = 8;

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const categories: { value: ProductCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'office_supplies', label: 'Art. de oficina/Papelería' },
    { value: 'kitchen_items', label: 'Artículos cocina' },
    { value: 'living_hinges', label: 'Bisagras vivas/Mecanismos' },
    { value: 'houses_furniture', label: 'Casas/Muebles' },
    { value: 'displays', label: 'Exhibidores' },
    { value: 'geometric_shapes', label: 'Figuras geométricas' },
    { value: 'lamps_clocks', label: 'Lámparas y Relojes' },
    { value: 'letters_numbers', label: 'Letras/Números' },
    { value: 'mandalas_dreamcatchers', label: 'Mandalas y Atrapa sueños' },
    { value: 'maps', label: 'Mapas' },
    { value: 'masks', label: 'Mascarillas y cubrebocas' },
    { value: 'nature', label: 'Naturaleza' },
    { value: 'christmas', label: 'Navidad' },
    { value: 'easter', label: 'Pascua' },
    { value: 'frames', label: 'Portarretratos/Marcos' },
    { value: 'shelves', label: 'Repisas/Estantes' },
    { value: 'puzzles', label: 'Rompecabezas' },
    { value: 'transportation', label: 'Transportes' },
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm, currentPage]);

  const loadProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);
      }

      // Add pagination
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value as ProductCategory | 'all');
              setCurrentPage(0);
            }}
            className="p-2 border rounded-md"
          >
            {categories.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="p-2 border rounded-md flex-grow"
          />
        </div>
      </div>

      <div className="relative">
        {currentPage > 0 && (
          <button
            onClick={prevPage}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {currentPage < totalPages - 1 && (
          <button
            onClick={nextPage}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform transition-transform duration-300 hover:scale-105">
              <div className="relative pb-[100%]">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <img
                  src={logo}
                  alt="Mayand Logo"
                  className="absolute top-2 left-2 h-8 w-auto z-10 opacity-60"
                />
                <button 
                  onClick={() => openModal(product)}
                  className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full hover:bg-green-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                  <button className="text-blue-500 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Material:</span>
                    <span className="font-medium">{product.material.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Medidas:</span>
                    <span className="font-medium">{product.width} x {product.height} cm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Precio unitario:</span>
                    <span className="font-medium">${product.unit_price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Precio mayoreo:</span>
                    <span className="font-medium">${product.bulk_price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center items-center gap-4">
          <span className="text-gray-600">
            Página {currentPage + 1} de {totalPages}
          </span>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
              <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Especificaciones</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Material:</span>
                      <span className="font-medium">{selectedProduct.material.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensiones:</span>
                      <span className="font-medium">{selectedProduct.width} x {selectedProduct.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Categoría:</span>
                      <span className="font-medium">
                        {categories.find(c => c.value === selectedProduct.category)?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Precios</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Precio unitario:</span>
                      <span className="font-medium">${selectedProduct.unit_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Precio mayoreo:</span>
                      <span className="font-medium">${selectedProduct.bulk_price}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Palabras clave</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.keywords.map((keyword, index) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-sm text-gray-600">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;