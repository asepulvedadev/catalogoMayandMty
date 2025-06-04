import { useRef, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import type { Product } from '../types/product';
import logo from '../assets/logo_mayand.png';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, loading, onProductClick }: ProductGridProps) => {
  const gridRef = useRef<FixedSizeGrid>(null);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterIndices({
        columnIndex: 0,
        rowIndex: 0,
        shouldForceUpdate: true,
      });
    }
  }, [products]);

  if (loading) {
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

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * 3 + columnIndex;
    const product = products[index];

    if (!product) return null;

    return (
      <div style={style}>
        <div className="m-3 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 hover:scale-102 hover:shadow-2xl backdrop-blur-sm">
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
              onClick={() => onProductClick(product)}
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
              <span className="text-primary font-semibold">MXN ${product.unit_price}</span>
              <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                {product.width}x{product.height}cm
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FixedSizeGrid
      ref={gridRef}
      columnCount={3}
      rowCount={Math.ceil(products.length / 3)}
      columnWidth={400}
      rowHeight={500}
      height={1000}
      width={1200}
      itemData={products}
    >
      {Cell}
    </FixedSizeGrid>
  );
};

export default ProductGrid;