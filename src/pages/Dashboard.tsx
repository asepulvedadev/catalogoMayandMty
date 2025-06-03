import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadImage, deleteImage } from '../utils/imageUpload';
import type { Product, ProductFormState, Material, ProductCategory } from '../types/product';

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
    category: 'office_supplies',
    keywords: [],
    images: []
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

    if (currentProduct.images.length >= 4) {
      alert('Maximum 4 images allowed per product');
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setCurrentProduct(prev => ({
          ...prev,
          images: [...prev.images, imageUrl],
          image_url: prev.image_url || imageUrl // Set as main image if none exists
        }));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (await deleteImage(imageUrl)) {
      setCurrentProduct(prev => {
        const newImages = prev.images.filter(img => img !== imageUrl);
        return {
          ...prev,
          images: newImages,
          image_url: imageUrl === prev.image_url ? newImages[0] || null : prev.image_url
        };
      });
    }
  };

  const handleSetMainImage = (imageUrl: string) => {
    setCurrentProduct(prev => ({
      ...prev,
      image_url: imageUrl
    }));
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
      category: 'office_supplies',
      keywords: [],
      images: []
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
      category: product.category,
      keywords: product.keywords,
      images: product.images || []
    });
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product?.images?.length) {
      for (const imageUrl of product.images) {
        await deleteImage(imageUrl);
      }
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value || null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
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
                <label className="block text-sm font-medium text-gray-700">Keywords</label>
                <input
                  type="text"
                  value={currentProduct.keywords.join(', ')}
                  onChange={handleKeywordsChange}
                  placeholder="Enter keywords separated by commas"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width (cm)</label>
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
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    value={currentProduct.height}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, height: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Price</label>
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
                  <label className="block text-sm font-medium text-gray-700">Bulk Price</label>
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
                  Images ({currentProduct.images.length}/4)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full"
                  disabled={currentProduct.images.length >= 4 || uploadingImage}
                />
                {uploadingImage && (
                  <div className="mt-2 text-sm text-gray-500">
                    Uploading image...
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentProduct.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        className={`h-32 w-full object-cover rounded ${imageUrl === currentProduct.image_url ? 'ring-2 ring-primary' : ''}`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(imageUrl)}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                          title="Set as main image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImageDelete(imageUrl)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                          title="Delete image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
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
                        height: 0,
                        unit_price: 0,
                        bulk_price: 0,
                        image_url: null,
                        category: 'office_supplies',
                        keywords: [],
                        images: []
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 disabled:opacity-50"
                >
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prices</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {product.images.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`${product.name} ${index + 1}`}
                            className={`h-20 w-20 object-cover rounded ${imageUrl === product.image_url ? 'ring-2 ring-primary' : ''}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Keywords: {product.keywords.join(', ')}
                      </div>
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
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary hover:text-primary-700 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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