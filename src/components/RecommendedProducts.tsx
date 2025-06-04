import { useRecommendations } from '../hooks/useRecommendations';
import { useTracking } from '../hooks/useTracking';
import type { Product } from '../types/product';

interface RecommendedProductsProps {
  onProductClick: (product: Product) => void;
}

export default function RecommendedProducts({ onProductClick }: RecommendedProductsProps) {
  const { recommendations, products, loading, error } = useRecommendations();
  const { trackView } = useTracking();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!recommendations || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recomendados para ti</h2>
        <div className="flex gap-2">
          {recommendations.preferences.categories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {recommendations.recommendations.explanation}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            onMouseEnter={() => trackView(product.id)}
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-primary-600 font-semibold">
                  ${product.unit_price}
                </span>
                <button
                  onClick={() => onProductClick(product)}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Ver más
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}