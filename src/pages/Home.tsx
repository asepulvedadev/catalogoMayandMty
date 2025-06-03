import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ProductCategory } from '../types/product';
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

      // Log Supabase connection details (without sensitive data)
      console.log('Attempting to connect to Supabase...');
      
      // Primero, obtener el total de productos para la paginación
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
        console.error('Error counting products:', countError);
        throw new Error(`Failed to count products: ${countError.message}`);
      }

      setTotalProducts(count || 0);

      // Luego, obtener los productos para la página actual
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
        console.error('Error fetching products:', fetchError);
        throw new Error(`Failed to fetch products: ${fetchError.message}`);
      }

      if (!data) {
        throw new Error('No data received from Supabase');
      }

      console.log('Successfully fetched products:', data.length);
      setProducts(data);
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total pages based on total products and items per page
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div className="w-[60%] px-4 py-8">
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
              className="fixed left-[15%] top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 transition-transform duration-300 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {currentPage < totalPages - 1 && (
            <button
              onClick={nextPage}
              className="fixed right-[15%] top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 transition-transform duration-300 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative pb-[100%] bg-gray-100">
                  {product.image_url && (
                    <img
                      loading="lazy"
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
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
                    className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Precio: ${product.unit_price}</span>
                    <span className="text-gray-500">{product.width}x{product.height}cm</span>
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
      </div>
    </div>
  );
};

export default Home;