import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Quote, QuoteItem, Customer } from '../types/customer';
import type { Product } from '../types/product';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { generateQuotePDF } from '../utils/pdfGenerator';

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Partial<Quote>>({
    customer_id: '',
    status: 'draft',
    notes: '',
    valid_until: format(new Date().setDate(new Date().getDate() + 15), 'yyyy-MM-dd')
  });
  const [quoteItems, setQuoteItems] = useState<Partial<QuoteItem>[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadQuotes(),
        loadCustomers(),
        loadProducts()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuotes = async () => {
    const { data, error: fetchError } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    setQuotes(data || []);
  };

  const loadCustomers = async () => {
    const { data, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (fetchError) throw fetchError;
    setCustomers(data || []);
  };

  const loadProducts = async () => {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (fetchError) throw fetchError;
    setProducts(data || []);
  };

  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }]);
  };

  const removeQuoteItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...quoteItems];
    const item = { ...updatedItems[index] };
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.unit_price = product.unit_price;
        item.total_price = product.unit_price * (item.quantity || 1);
      }
    } else if (field === 'quantity') {
      item.total_price = (item.unit_price || 0) * value;
    }

    item[field] = value;
    updatedItems[index] = item;
    setQuoteItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!currentQuote.customer_id) {
        throw new Error('Debe seleccionar un cliente');
      }

      if (quoteItems.length === 0) {
        throw new Error('Debe agregar al menos un producto');
      }

      if (isEditing && currentQuote.id) {
        // Actualizar cotización
        const { error: updateError } = await supabase
          .from('quotes')
          .update(currentQuote)
          .eq('id', currentQuote.id);

        if (updateError) throw updateError;

        // Eliminar items anteriores
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', currentQuote.id);

        if (deleteError) throw deleteError;

        // Insertar nuevos items
        const { error: insertError } = await supabase
          .from('quote_items')
          .insert(quoteItems.map(item => ({
            ...item,
            quote_id: currentQuote.id
          })));

        if (insertError) throw insertError;

        setSuccess('Cotización actualizada exitosamente');
      } else {
        // Crear nueva cotización
        const { data: quote, error: insertError } = await supabase
          .from('quotes')
          .insert([currentQuote])
          .select()
          .single();

        if (insertError) throw insertError;

        // Insertar items
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(quoteItems.map(item => ({
            ...item,
            quote_id: quote.id
          })));

        if (itemsError) throw itemsError;

        setSuccess('Cotización creada exitosamente');
      }

      resetForm();
      loadQuotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cotización');
    }
  };

  const handleEdit = async (quote: Quote) => {
    try {
      const { data: items, error: fetchError } = await supabase
        .from('quote_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('quote_id', quote.id);

      if (fetchError) throw fetchError;

      setIsEditing(true);
      setCurrentQuote(quote);
      setQuoteItems(items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles de la cotización');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSuccess('Cotización eliminada exitosamente');
      loadQuotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cotización');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentQuote({
      customer_id: '',
      status: 'draft',
      notes: '',
      valid_until: format(new Date().setDate(new Date().getDate() + 15), 'yyyy-MM-dd')
    });
    setQuoteItems([]);
  };

  if (loading && quotes.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cotizaciones</h1>

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
              {isEditing ? 'Editar Cotización' : 'Nueva Cotización'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select
                    value={currentQuote.customer_id}
                    onChange={(e) => setCurrentQuote({ ...currentQuote, customer_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.company ? `- ${customer.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={currentQuote.status}
                    onChange={(e) => setCurrentQuote({ ...currentQuote, status: e.target.value as Quote['status'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  >
                    <option value="draft">Borrador</option>
                    <option value="sent">Enviada</option>
                    <option value="accepted">Aceptada</option>
                    <option value="rejected">Rechazada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Válida hasta</label>
                  <input
                    type="date"
                    value={currentQuote.valid_until}
                    onChange={(e) => setCurrentQuote({ ...currentQuote, valid_until: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
                <div className="space-y-4">
                  {quoteItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <select
                          value={item.product_id}
                          onChange={(e) => updateQuoteItem(index, 'product_id', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          required
                        >
                          <option value="">Seleccionar producto</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.unit_price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuoteItem(index, 'quantity', parseInt(e.target.value))}
                          min="1"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateQuoteItem(index, 'unit_price', parseFloat(e.target.value))}
                          step="0.01"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={item.total_price}
                          readOnly
                          className="block w-full rounded-md border-gray-300 bg-gray-50 sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuoteItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addQuoteItem}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Agregar Producto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea
                  value={currentQuote.notes}
                  onChange={(e) => setCurrentQuote({ ...currentQuote, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700"
                >
                  {isEditing ? 'Actualizar Cotización' : 'Crear Cotización'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul role="list" className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <li key={quote.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary truncate">
                              {quote.quote_number}
                            </p>
                            <div className="ml-2">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${quote.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                                ${quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                                ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                                ${quote.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                {quote.status === 'draft' && 'Borrador'}
                                {quote.status === 'sent' && 'Enviada'}
                                {quote.status === 'accepted' && 'Aceptada'}
                                {quote.status === 'rejected' && 'Rechazada'}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {quote.customer?.name} {quote.customer?.company ? `- ${quote.customer.company}` : ''}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(quote)}
                            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(quote.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const { data: items } = await supabase
                                  .from('quote_items')
                                  .select(`
                                    *,
                                    product:products(*)
                                  `)
                                  .eq('quote_id', quote.id);

                                if (items) {
                                  const doc = generateQuotePDF(quote, items);
                                  doc.save(`cotizacion-${quote.quote_number}.pdf`);
                                }
                              } catch (err) {
                                setError('Error al generar el PDF');
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Total: ${quote.total_amount}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Válida hasta: {format(new Date(quote.valid_until || ''), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          Creada: {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}