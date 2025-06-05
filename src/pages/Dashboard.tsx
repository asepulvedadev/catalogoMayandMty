import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import { getSuggestedTags } from '../utils/tagsDictionary';
import type { Product, ProductFormState, Material, ProductCategory, ProductView } from '../types/product';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const PRODUCTS_PER_PAGE = 12;

const materials: Material[] = ['mdf', 'acrilico', 'pvc', 'coroplax', 'acetato', 'carton', 'tela'];

const commonTags = [
  // Materiales
  'mdf', 'acrílico', 'pvc', 'coroplast', 'acetato', 'cartón', 'tela', 'madera', 'triplay', 'contrachapado',
  'melamina', 'policarbonato', 'poliestireno', 'espuma', 'cuero', 'fieltro', 'papel', 'fibra', 'composite',
  
  // Técnicas de corte y grabado
  'corte láser', 'grabado', 'ensamblado', 'montaje', 'pegado', 'biselado', 'ranurado', 'engranado',
  'encajado', 'doblado', 'calado', 'perforado', 'tallado', 'marcado', 'quemado', 'pirograbado',
  'grabado vectorial', 'corte vectorial', 'corte por capas', 'grabado profundo', 'grabado superficial',
  
  // Características
  'personalizable', 'montable', 'desmontable', 'plegable', 'apilable', 'intercambiable', 'ajustable',
  'modular', 'portátil', 'reversible', 'multiuso', 'transformable', 'adaptable', 'configurable',
  
  // Usos y aplicaciones
  'decorativo', 'funcional', 'educativo', 'publicitario', 'exhibición', 'organizador', 'almacenamiento',
  'presentación', 'señalización', 'identificación', 'información', 'orientación', 'promoción',
  
  // Tamaños y dimensiones
  'pequeño', 'mediano', 'grande', 'extra grande', 'mini', 'micro', 'gigante', 'compacto', 'espacioso',
  
  // Estilos y diseños
  'minimalista', 'moderno', 'clásico', 'vintage', 'contemporáneo', 'industrial', 'rústico', 'elegante',
  'sofisticado', 'artístico', 'creativo', 'innovador', 'tradicional', 'étnico', 'bohemio', 'retro',
  
  // Aplicaciones específicas
  'hogar', 'oficina', 'escuela', 'eventos', 'exhibiciones', 'comercio', 'restaurante', 'hotel',
  'museo', 'galería', 'teatro', 'cine', 'biblioteca', 'hospital', 'clínica', 'gimnasio',
  
  // Especificaciones técnicas
  'resistente', 'ligero', 'durable', 'reutilizable', 'reciclable', 'biodegradable', 'sostenible',
  'ecológico', 'antialérgico', 'antibacterial', 'ignífugo', 'impermeable', 'resistente al agua',
  
  // Categorías de productos
  'portarretratos', 'exhibidores', 'letras', 'números', 'figuras', 'marcos', 'repisas', 'estantes',
  'rompecabezas', 'muebles', 'lámparas', 'relojes', 'cajas', 'organizadores', 'separadores',
  'soportes', 'stands', 'vitrinas', 'mostradores', 'biombos', 'divisores', 'paneles',
  
  // Artesanías y decoraciones
  'artesanía', 'manualidad', 'decoración', 'ornamento', 'adorno', 'centro de mesa', 'móvil',
  'colgante', 'escultura', 'relieve', 'bajorrelieve', 'talla', 'tallado', 'grabado artístico',
  'diseño artístico', 'arte decorativo', 'arte funcional', 'arte utilitario',
  
  // Elementos decorativos
  'flor', 'hoja', 'árbol', 'animal', 'pájaro', 'mariposa', 'insecto', 'marino', 'geometría',
  'patrón', 'textura', 'motivo', 'símbolo', 'emblema', 'logo', 'marca', 'firma',
  
  // Técnicas artísticas
  'calado artístico', 'grabado artístico', 'tallado artístico', 'pirograbado artístico',
  'quemado artístico', 'marcado artístico', 'diseño artístico', 'arte digital',
  
  // Características especiales
  'iluminado', 'interactivo', 'modular', 'ajustable', 'portátil', 'plegable', 'desmontable',
  'transformable', 'multifuncional', 'versátil', 'adaptable', 'personalizable',
  
  // Técnicas de acabado
  'pulido', 'lijado', 'barnizado', 'lacado', 'pintado', 'teñido', 'estofado', 'dorado',
  'plateado', 'cromado', 'mate', 'brillante', 'texturizado', 'grabado profundo',
  
  // Materiales adicionales
  'madera natural', 'madera tratada', 'madera reciclada', 'madera certificada',
  'plástico reciclado', 'materiales reciclados', 'materiales ecológicos',
  
  // Usos específicos
  'organizador', 'almacenamiento', 'presentación', 'decoración', 'señalización',
  'identificación', 'información', 'orientación', 'promoción', 'publicidad',
  
  // Categorías de diseño
  'diseño industrial', 'diseño gráfico', 'diseño arquitectónico', 'diseño de interiores',
  'diseño de producto', 'diseño de mobiliario', 'diseño de iluminación',
  
  // Elementos estructurales
  'estructura', 'soporte', 'base', 'marco', 'borde', 'contorno', 'perfil', 'silueta',
  'forma', 'figura', 'composición', 'ensamblaje', 'unión', 'conexión',
  
  // Características de diseño
  'simétrico', 'asimétrico', 'balanceado', 'armónico', 'proporcionado', 'equilibrado',
  'dinámico', 'estático', 'fluido', 'rígido', 'flexible', 'adaptable'
];

const productViews: { value: ProductView; label: string }[] = [
  { value: 'front', label: 'Vista Frontal' },
  { value: 'left', label: 'Lateral Izquierdo' },
  { value: 'right', label: 'Lateral Derecho' },
  { value: 'perspective', label: 'Perspectiva' }
];

const categories: { value: ProductCategory; label: string }[] = [
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

const Dashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedView, setSelectedView] = useState<ProductView>('front');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductFormState>({
    name: '',
    description: null,
    material: 'mdf',
    width: 0,
    length: 0,
    height: 0,
    unit_price: 0,
    bulk_price: 0,
    image_url: null,
    category: 'office_supplies',
    keywords: [],
    images: [],
    product_views: {}
  });
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .range(page * PRODUCTS_PER_PAGE, (page + 1) * PRODUCTS_PER_PAGE - 1)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        setProducts(page === 0 ? data : [...products, ...data]);
        setHasMore(count ? (page + 1) * PRODUCTS_PER_PAGE < count : false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentProduct.images.length >= 4) {
      setError('Máximo 4 imágenes por producto');
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setCurrentProduct(prev => ({
          ...prev,
          images: [...prev.images, imageUrl],
          product_views: {
            ...prev.product_views,
            [selectedView]: imageUrl
          },
          image_url: prev.image_url || imageUrl
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      if (await deleteImage(imageUrl)) {
        setCurrentProduct(prev => {
          const newImages = prev.images.filter(img => img !== imageUrl);
          const newProductViews = { ...prev.product_views };
          
          // Eliminar la imagen de las vistas si está siendo usada
          Object.keys(newProductViews).forEach(key => {
            if (newProductViews[key as ProductView] === imageUrl) {
              delete newProductViews[key as ProductView];
            }
          });

          return {
            ...prev,
            images: newImages,
            product_views: newProductViews,
            image_url: imageUrl === prev.image_url ? newImages[0] || null : prev.image_url
          };
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la imagen');
    }
  };

  const handleSetImageView = (imageUrl: string, view: ProductView) => {
    setCurrentProduct(prev => ({
      ...prev,
      product_views: {
        ...prev.product_views,
        [view]: imageUrl
      },
      image_url: view === 'front' ? imageUrl : prev.image_url
    }));
  };

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
        length: 0,
        height: 0,
        unit_price: 0,
        bulk_price: 0,
        image_url: null,
        category: 'office_supplies',
        keywords: [],
        images: [],
        product_views: {}
      });
      setPage(0);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      material: product.material,
      width: product.width,
      length: product.length,
      height: product.height,
      unit_price: product.unit_price,
      bulk_price: product.bulk_price,
      image_url: product.image_url,
      category: product.category,
      keywords: product.keywords || [],
      images: product.images || [],
      product_views: product.product_views || {}
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (product?.images?.length) {
        for (const imageUrl of product.images) {
          await deleteImage(imageUrl);
        }
      }

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuccess('Producto eliminado exitosamente');
      setPage(0);
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el producto');
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Usar la función getSuggestedTags del diccionario
    const matchingTags = getSuggestedTags(value, currentProduct.keywords);
    
    // Si hay coincidencias y el usuario está escribiendo, mostrar sugerencias
    if (matchingTags.length > 0 && value.length > 0) {
      setSuggestedTags(matchingTags);
    } else {
      setSuggestedTags([]);
    }
  };

  const addSuggestedTag = (tag: string) => {
    // Verificar si ya alcanzamos el límite de 6 etiquetas
    if (currentProduct.keywords.length >= 6) {
      setError('Máximo 6 etiquetas por producto');
      return;
    }

    // Verificar si la etiqueta ya existe
    if (currentProduct.keywords.includes(tag)) {
      setError('Esta etiqueta ya está agregada');
      return;
    }

    const newKeywords = [...currentProduct.keywords, tag];
    setCurrentProduct(prev => ({ ...prev, keywords: newKeywords }));
    setSuggestedTags([]);
    setInputValue(''); // Limpiar el input
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            {error && (
              <ErrorMessage
                title="Error"
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

            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value || null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  value={currentProduct.category}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value as ProductCategory })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                >
                  {categories.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Etiquetas ({currentProduct.keywords.length}/6)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleKeywordsChange}
                    placeholder="Ingrese etiquetas separadas por comas"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    disabled={currentProduct.keywords.length >= 6}
                  />
                  {suggestedTags.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                      {suggestedTags.map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addSuggestedTag(tag)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentProduct.keywords.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newKeywords = currentProduct.keywords.filter((_, i) => i !== index);
                          setCurrentProduct(prev => ({ ...prev, keywords: newKeywords }));
                        }}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Material</label>
                <select
                  value={currentProduct.material}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, material: e.target.value as Material })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                >
                  {materials.map((material) => (
                    <option key={material} value={material}>
                      {material.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ancho (cm)</label>
                  <input
                    type="number"
                    value={currentProduct.width}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, width: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Largo (cm)</label>
                  <input
                    type="number"
                    value={currentProduct.length}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, length: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Alto (cm)</label>
                  <input
                    type="number"
                    value={currentProduct.height}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, height: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio Unitario (MXN)</label>
                  <input
                    type="number"
                    value={currentProduct.unit_price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, unit_price: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio Mayoreo (MXN)</label>
                  <input
                    type="number"
                    value={currentProduct.bulk_price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, bulk_price: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vista a subir
                </label>
                <select
                  value={selectedView}
                  onChange={(e) => setSelectedView(e.target.value as ProductView)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm mb-4"
                >
                  {productViews.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/webp,image/png"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary-700"
                  disabled={currentProduct.images.length >= 4 || uploadingImage}
                />
                {uploadingImage && (
                  <div className="mt-2 text-sm text-gray-500">
                    Subiendo imagen...
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {productViews.map(({ value, label }) => (
                    <div key={value} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-2">{label}</h3>
                      {currentProduct.product_views[value] ? (
                        <div className="relative group">
                          <img
                            src={currentProduct.product_views[value]}
                            alt={`Vista ${label}`}
                            className="h-32 w-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleImageDelete(currentProduct.product_views[value]!)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Todas las imágenes</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {currentProduct.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Imagen ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex flex-col items-center justify-center space-y-2">
                          <select
                            value={Object.entries(currentProduct.product_views).find(([, url]) => url === imageUrl)?.[0] || ''}
                            onChange={(e) => handleSetImageView(imageUrl, e.target.value as ProductView)}
                            className="text-sm bg-white rounded px-2 py-1"
                          >
                            <option value="">Seleccionar vista</option>
                            {productViews.map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleImageDelete(imageUrl)}
                            className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentProduct({
                        name: '',
                        description: null,
                        material: 'mdf',
                        width: 0,
                        length: 0,
                        height: 0,
                        unit_price: 0,
                        bulk_price: 0,
                        image_url: null,
                        category: 'office_supplies',
                        keywords: [],
                        images: [],
                        product_views: {}
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 disabled:opacity-50"
                >
                  {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Precio unitario</p>
                      <p className="text-lg font-semibold text-primary">MXN ${product.unit_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Precio mayoreo</p>
                      <p className="text-lg font-semibold text-gray-700">MXN ${product.bulk_price}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-700 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-700 transition-colors"
              >
                Cargar más productos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;