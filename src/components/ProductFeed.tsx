import { useEffect, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Product } from '../types/product';
import logo from '../assets/logo_mayand.png';
import 'swiper/css';
import 'swiper/css/navigation';

interface ProductFeedProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const ProductFeed = ({ products, loading, onProductClick, onLoadMore, hasMore }: ProductFeedProps) => {
  const observer = useRef<IntersectionObserver>();
  const lastProductRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, onLoadMore]);

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-64 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          ref={index === products.length - 1 ? lastProductRef : null}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl backdrop-blur-sm"
        >
          <div className="relative aspect-square bg-gray-100 overflow-hidden group">
            <Swiper
              modules={[Navigation]}
              navigation
              className="absolute inset-0 h-full"
            >
              {product.images.map((image, imageIndex) => (
                <SwiperSlide key={imageIndex} className="h-full">
                  <img
                    src={image}
                    alt={`${product.name} - Vista ${imageIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <img
              src={logo}
              alt="Mayand Logo"
              className="absolute top-2 left-2 h-8 w-auto z-10 opacity-60"
            />
          </div>
          <div className="p-4 bg-gradient-to-b from-white to-gray-50">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center text-sm mt-4">
              <span className="text-primary font-semibold">MXN ${product.unit_price}</span>
              <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                {product.width}x{product.height}cm
              </span>
            </div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="col-span-full flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default ProductFeed;