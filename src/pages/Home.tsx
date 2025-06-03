import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ProductCategory } from '../types/product';
import Header from '../components/Header';
import logo from '../assets/logo_mayand.png';

const ITEMS_PER_PAGE = 8;

const categories = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'christmas', label: 'Navidad' },
  { value: 'displays', label: 'Displays' },
  { value: 'easter', label: 'Pascua' },
  { value: 'frames', label: 'Marcos' },
  { value: 'geometric_shapes', label: 'Formas Geométricas' },
  { value: 'houses_furniture', label: 'Casas y Muebles' },
  { value: 'kitchen_items', label: 'Artículos de Cocina' },
  { value: 'lamps_clocks', label: 'Lámparas y Relojes' },
  { value: 'letters_numbers', label: 'Letras y Números' },
  { value: 'living_hinges', label: 'Living Hinges' },
  { value: 'mandalas_dreamcatchers', label: 'Mandalas y Atrapasueños' },
  { value: 'maps', label: 'Mapas' },
  { value: 'masks', label: 'Máscaras' },
  { value: 'nature', label: 'Naturaleza' },
  { value: 'office_supplies', label: 'Artículos de Oficina' },
  { value: 'puzzles', label: 'Rompecabezas' },
  { value: 'shelves', label: 'Estantes' },
  { value: 'transportation', label: 'Transporte' }
];

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm, currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let countQuery = supabase
        .from('products')
        .select('id', { count: 'exact' });

      if (selectedCategory !== 'all') {
        countQuery = countQuery.eq('category', selectedCategory);
      }

      if (searchTerm) {
        countQuery = countQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) {
        throw new Error(`Failed to count products: ${countError.message}`);
      }

      setTotalProducts(count || 0);

      let query = supabase
        .from('products')
        .select('*')
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch products: ${fetchError.message}`);
      }

      if (!data) {
        throw new Error('No data received from Supabase');
      }

      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearch={handleSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <div className="flex justify-center min-h-screen bg-gray-50">
        <div className="w-full md:w-[80%] lg:w-[90%] xl:w-[80%] px-4 py-8">
          <div className="mb-8">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as ProductCategory | 'all');
                setCurrentPage(0);
              }}
              className="p-2 border rounded-md w-full md:w-auto focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {categories.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl backdrop-blur-sm"
              >
                <div className="relative pb-[100%] bg-gray-100 overflow-hidden group">
                  {product.image_url && (
                    <img
                      loading="lazy"
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                      onLoad={(e) => (e.target as HTMLImageElement).classList.add('opacity-100')}
                      style={{ opacity: 0 }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <img
                    src={logo}
                    alt="Mayand Logo"
                    className="absolute top-2 left-2 h-8 w-auto z-10 opacity-60"
                  />
                  <button 
                    onClick={() => openModal(product)}
                    className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-300 transform hover:scale-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center text-sm mt-4">
                    <span className="text-primary font-semibold">$ {product.unit_price}</span>
                    <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                      {product.width}x{product.height}cm
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-t-xl"
                />
              )}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedProduct.name}</h2>
              <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Material</p>
                  <p className="font-semibold text-gray-800">{selectedProduct.material.toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Dimensiones</p>
                  <p className="font-semibold text-gray-800">{selectedProduct.width} x {selectedProduct.height} cm</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div>
                  <p className="text-sm text-gray-500">Precio unitario</p>
                  <p className="text-2xl font-bold text-primary">${selectedProduct.unit_price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Precio mayoreo</p>
                  <p className="text-xl font-semibold text-gray-800">${selectedProduct.bulk_price}</p>
                </div>
              </div>
              {selectedProduct.keywords && selectedProduct.keywords.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Etiquetas:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.keywords.map((keyword, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;