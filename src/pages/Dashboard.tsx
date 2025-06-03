import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../utils/imageUpload';
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      const uploadPromises = files.map(file => uploadImage(file));
      const imageUrls = await Promise.all(uploadPromises);
      const validUrls = imageUrls.filter((url): url is string => url !== null);

      if (validUrls.length > 0) {
        const newImages = [...currentProduct.images, ...validUrls].slice(0, 4);
        setCurrentProduct({ 
          ...currentProduct, 
          images: newImages,
          image_url: newImages[0] // Set first image as main image for backward compatibility
        });
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    const imagePath = imageUrl.split('/').pop();
    if (imagePath) {
      await supabase.storage
        .from('products')
        .remove([`product-images/${imagePath}`]);
    }

    const newImages = currentProduct.images.filter(img => img !== imageUrl);
    setCurrentProduct({
      ...currentProduct,
      images: newImages,
      image_url: newImages[0] || null
    });
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
      keywords: product.keywords,
    });
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (product?.images) {
      const imagePaths = product.images.map(url => `product-images/${url.split('/').pop()}`);
      await supabase.storage
        .from('products')
        .remove(imagePaths);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-8 bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={currentProduct.name}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={currentProduct.category}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value as ProductCategory })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  >
                    {categories.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={currentProduct.description || ''}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value || null })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={currentProduct.keywords.join(', ')}
                  onChange={handleKeywordsChange}
                  placeholder="Enter keywords separated by commas"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                  <select
                    value={currentProduct.material}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, material: e.target.value as Material })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                    <input
                      type="number"
                      value={currentProduct.width}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, width: parseFloat(e.target.value) })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={currentProduct.height}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, height: parseFloat(e.target.value) })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={currentProduct.unit_price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, unit_price: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Price</label>
                  <input
                    type="number"
                    value={currentProduct.bulk_price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, bulk_price: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images (Max 4)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  multiple
                  className="w-full"
                  disabled={currentProduct.images.length >= 4 || uploadingImage}
                />
                {uploadingImage && (
                  <div className="mt-2 text-sm text-gray-500">
                    Uploading images...
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentProduct.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imageUrl)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
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
                        images: [],
                        category: 'office_supplies',
                        keywords: [],
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
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
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {(product.images || [product.image_url]).filter(Boolean).map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl || ''}
                              alt={`${product.name} ${index + 1}`}
                              className="h-16 w-16 object-cover rounded-lg shadow-sm"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{product.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {product.keywords.join(', ')}
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
                        <div className="text-sm font-medium text-primary">${product.unit_price}</div>
                        <div className="text-sm text-gray-500">${product.bulk_price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:text-primary-700 mr-4 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
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
    </div>
  );
};

export default Dashboard;