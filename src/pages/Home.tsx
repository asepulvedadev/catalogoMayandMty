import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import { useTracking } from '../hooks/useTracking';
import type { Product, ProductCategory, Material } from '../types/product';
import Header from '../components/Header';
import ProductFeed from '../components/ProductFeed';

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

const materials: { value: Material; label: string }[] = [
  { value: 'mdf', label: 'MDF' },
  { value: 'acrilico', label: 'Acrílico' },
  { value: 'pvc', label: 'PVC' },
  { value: 'coroplax', label: 'Coroplax' },
  { value: 'acetato', label: 'Acetato' },
  { value: 'carton', label: 'Cartón' },
  { value: 'tela', label: 'Tela' }
];

const sortOptions = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price', label: 'Precio' },
  { value: 'name', label: 'Nombre' }
];

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { trackView, trackAction } = useTracking();
  const {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    products,
    loading,
    error,
    loadMore
  } = useSearch();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (type: string, value: any) => {
    if (type === 'category') {
      updateFilters({ category: value === 'all' ? undefined : value as ProductCategory });
    } else if (type === 'material') {
      updateFilters({ material: value === 'all' ? undefined : value as Material });
    } else if (type === 'sort') {
      const [sortBy, sortDirection] = value.split('-');
      updateFilters({ sortBy, sortDirection });
    }
  };

  const openModal = async (product: Product) => {
    setSelectedProduct(product);
    await trackAction(product.id, 'click');
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const FiltersSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={filters.category || 'all'}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {categories.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <select
              value={filters.material || 'all'}
              onChange={(e) => handleFilterChange('material', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos los materiales</option>
              {materials.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
            <select
              value={`${filters.sortBy || 'relevance'}-${filters.sortDirection || 'desc'}`}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {sortOptions.map(({ value, label }) => (
                <>
                  <option key={`${value}-desc`} value={`${value}-desc`}>{label} (Mayor a menor)</option>
                  <option key={`${value}-asc`} value={`${value}-asc`}>{label} (Menor a mayor)</option>
                </>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearch={handleSearch}
      />
      <div className="flex justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-[1600px] px-4 py-8 flex">
          {/* Filtros para desktop */}
          <div className="hidden lg:block w-64 mr-8">
            <div className="sticky top-24">
              <FiltersSection />
            </div>
          </div>

          <div className="flex-1">
            {/* Filtros para móvil y tablet */}
            <div className="lg:hidden mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={filters.material || 'all'}
                onChange={(e) => handleFilterChange('material', e.target.value)}
                className="p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Todos los materiales</option>
                {materials.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={`${filters.sortBy || 'relevance'}-${filters.sortDirection || 'desc'}`}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {sortOptions.map(({ value, label }) => (
                  <>
                    <option key={`${value}-desc`} value={`${value}-desc`}>{label} (Mayor a menor)</option>
                    <option key={`${value}-asc`} value={`${value}-asc`}>{label} (Menor a mayor)</option>
                  </>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <ProductFeed
              products={products}
              loading={loading}
              onProductClick={openModal}
              onLoadMore={loadMore}
              hasMore={true}
            />
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
                  <p className="text-2xl font-bold text-primary">MXN ${selectedProduct.unit_price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Precio mayoreo</p>
                  <p className="text-xl font-semibold text-gray-800">MXN ${selectedProduct.bulk_price}</p>
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