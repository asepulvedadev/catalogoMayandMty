import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import type { Product, ProductFormState, Material, ProductCategory } from '../types/product';
import Header from '../components/Header';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductFormState>({
    name: '',
    description: null,
    material: 'mdf',
    width: 0,
    height: 0,
    unit_price: 0,
    bulk_price: 0,
    image_url: null,
    images: [],
    category: 'office_supplies',
    keywords: [],
  });

  const materials: Material[] = ['mdf', 'acrilico', 'pvc', 'coroplax', 'acetato', 'carton', 'tela'];
  
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
    { value: 'masks', label: 'Máscaras' },
    { value: 'nature', label: 'Naturaleza' },
    { value: 'christmas', label: 'Navidad' },
    { value: 'easter', label: 'Pascua' },
    { value: 'frames', label: 'Portarretratos/Marcos' },
    { value: 'shelves', label: 'Repisas/Estantes' },
    { value: 'puzzles', label: 'Rompecabezas' },
    { value: 'transportation', label: 'Transportes' },
  ];

  useEffect(() => {
    checkUser();
    loadProducts();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin');
      }
    } catch (error) {
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products:', error);
      return;
    }

    setProducts(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        const newImages = [...(currentProduct.images || []), imageUrl];
        setCurrentProduct({ 
          ...currentProduct, 
          image_url: imageUrl, // Keep for backwards compatibility
          images: newImages 
        });
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentProduct.id) {
      const { id, ...updateData } = currentProduct;
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        return;
      }
    } else {
      const { id, ...insertData } = currentProduct;
      const { error } = await supabase
        .from('products')
        .insert([insertData]);

      if (error) {
        console.error('Error creating product:', error);
        return;
      }
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
      images: [],
      category: 'office_supplies',
      keywords: [],
    });
    loadProducts();
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      material: product.material,
      width: product.width,
      height: product.height,
      unit_price: product.unit_price,
      bulk_price: product.bulk_price,
      image_url: product.image_url,
      images: product.images || [],
      category: product.category,
      keywords: product.keywords || [],
    });
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product?.images?.length) {
      await Promise.all(product.images.map(url => deleteImage(url)));
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return;
    }

    loadProducts();
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k !== '');
    setCurrentProduct({ ...currentProduct, keywords });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={currentProduct.category}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value as ProductCategory })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  required
                >
                  {categories.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value || null })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <select
                  value={currentProduct.material}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, material: e.target.value as Material })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  required
                >
                  {materials.map((material) => (
                    <option key={material} value={material}>
                      {material.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                <input
                  type="text"
                  value={currentProduct.keywords.join(', ')}
                  onChange={handleKeywordsChange}
                  placeholder="Separadas por comas"
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ancho (cm)</label>
                <input
                  type="number"
                  value={currentProduct.width}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, width: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  required
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alto (cm)</label>
                <input
                  type="number"
                  value={currentProduct.height}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, height: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  required
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario</label>
                <input
                  type="number"
                  value={currentProduct.unit_price}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, unit_price: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Mayoreo</label>
                <input
                  type="number"
                  value={currentProduct.bulk_price}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, bulk_price: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                  required
                  step="0.01"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                />
                {uploadingImage && (
                  <p className="mt-2 text-sm text-gray-500">Subiendo imagen...</p>
                )}
                {currentProduct.images && currentProduct.images.length > 0 && (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {currentProduct.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = currentProduct.images.filter((_, i) => i !== index);
                            setCurrentProduct({ ...currentProduct, images: newImages });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
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
                      height: 0,
                      unit_price: 0,
                      bulk_price: 0,
                      image_url: null,
                      images: [],
                      category: 'office_supplies',
                      keywords: [],
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={uploadingImage}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensiones</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precios</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                      {product.keywords && product.keywords.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Etiquetas: {product.keywords.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categories.find(c => c.value === product.category)?.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.material.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.width} x {product.height} cm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Unit: ${product.unit_price}</div>
                      <div className="text-sm text-gray-500">Bulk: ${product.bulk_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:text-primary-700 transition-colors duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;