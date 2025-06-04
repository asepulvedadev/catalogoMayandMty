import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/customer';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    tax_id: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (isEditing && currentCustomer.id) {
        const { error: updateError } = await supabase
          .from('customers')
          .update(currentCustomer)
          .eq('id', currentCustomer.id);

        if (updateError) throw updateError;
        setSuccess('Cliente actualizado exitosamente');
      } else {
        const { error: insertError } = await supabase
          .from('customers')
          .insert([{ ...currentCustomer, created_by: user.id }]);

        if (insertError) throw insertError;
        setSuccess('Cliente creado exitosamente');
      }

      resetForm();
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCustomer({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      tax_id: '',
      notes: ''
    });
  };

  const handleEdit = (customer: Customer) => {
    setIsEditing(true);
    setCurrentCustomer(customer);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSuccess('Cliente eliminado exitosamente');
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el cliente');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Lista de Clientes */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Clientes</h2>
              <button
                onClick={resetForm}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Nuevo Cliente
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul role="list" className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <li key={customer.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-primary truncate">{customer.name}</p>
                          {customer.company && (
                            <span className="ml-2 text-sm text-gray-500">({customer.company})</span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4">
                          {customer.email && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Email:</span> {customer.email}
                            </p>
                          )}
                          {customer.phone && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Teléfono:</span> {customer.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-primary hover:text-primary-700 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              {error && (
                <ErrorMessage
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentCustomer.name}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={currentCustomer.company || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, company: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentCustomer.email || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={currentCustomer.phone || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={currentCustomer.address || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={currentCustomer.city || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, city: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={currentCustomer.state || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, state: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={currentCustomer.postal_code || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, postal_code: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      RFC
                    </label>
                    <input
                      type="text"
                      value={currentCustomer.tax_id || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, tax_id: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notas
                    </label>
                    <textarea
                      value={currentCustomer.notes || ''}
                      onChange={(e) => setCurrentCustomer({ ...currentCustomer, notes: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
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
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}