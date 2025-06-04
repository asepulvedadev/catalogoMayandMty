import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/customer';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
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

    try {
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
          .insert([currentCustomer]);

        if (insertError) throw insertError;
        setSuccess('Cliente creado exitosamente');
      }

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
      loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el cliente');
    }
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

  if (loading && customers.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>

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
              {isEditing ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={currentCustomer.name}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Empresa</label>
                  <input
                    type="text"
                    value={currentCustomer.company}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, company: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={currentCustomer.email}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={currentCustomer.phone}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    type="text"
                    value={currentCustomer.address}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <input
                    type="text"
                    value={currentCustomer.city}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, city: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <input
                    type="text"
                    value={currentCustomer.state}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, state: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                  <input
                    type="text"
                    value={currentCustomer.postal_code}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, postal_code: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">RFC</label>
                  <input
                    type="text"
                    value={currentCustomer.tax_id}
                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, tax_id: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea
                  value={currentCustomer.notes}
                  onChange={(e) => setCurrentCustomer({ ...currentCustomer, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
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
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700"
                >
                  {isEditing ? 'Actualizar Cliente' : 'Agregar Cliente'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <li key={customer.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">
                            {customer.name}
                          </p>
                          {customer.company && (
                            <p className="text-sm text-gray-500">
                              {customer.company}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          {customer.email && (
                            <p className="flex items-center text-sm text-gray-500">
                              {customer.email}
                            </p>
                          )}
                          {customer.phone && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {customer.phone}
                            </p>
                          )}
                        </div>
                        {customer.tax_id && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            RFC: {customer.tax_id}
                          </div>
                        )}
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