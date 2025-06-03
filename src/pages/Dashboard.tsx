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

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setCurrentProduct(prev => ({
          ...prev,
          image_url: imageUrl,
          images: [...(prev.images || []), imageUrl]
        }));
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
        const imagePath = imageUrl.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('products')
            .remove([`product-images/${imagePath}`]);
        }
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
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full"
                />
                {uploadingImage && (
                  <div className="mt-2 text-sm text-gray-500">
                    Uploading image...
                  </div>
                )}
                {currentProduct.image_url && (
                  <div className="mt-2">
                    <img
                      src={currentProduct.image_url}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded"
                    />
                  </div>
                )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
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
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-20 w-20 object-cover rounded"
                        />
                      )}
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