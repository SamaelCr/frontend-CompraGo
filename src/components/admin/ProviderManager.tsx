import React, { useState, useEffect } from 'react';
import type { Provider } from '../../utils/api';
import { getProviders, createProvider, updateProvider, deleteProvider } from '../../utils/api';

export default function ProviderManager({ initialProviders }: { initialProviders: Provider[] }) {
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({ name: '', rif: '', address: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const data = await getProviders();
      setProviders(data);
    } catch (err) {
      setError('Error al cargar los proveedores.');
    }
  };

  const handleOpenModal = (provider: Provider | null = null) => {
    setError(null);
    setEditingProvider(provider);
    setFormData(provider ? { name: provider.name, rif: provider.rif, address: provider.address } : { name: '', rif: '', address: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('El nombre es obligatorio.');
      return;
    }
    setError(null);
    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id, formData);
      } else {
        await createProvider(formData);
      }
      await fetchProviders();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este proveedor?')) {
      try {
        await deleteProvider(id);
        await fetchProviders();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Crear Proveedor
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">RIF</th>
              <th className="px-6 py-3">Dirección</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{provider.name}</td>
                <td className="px-6 py-4">{provider.rif}</td>
                <td className="px-6 py-4 max-w-sm truncate">{provider.address}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(provider)} className="font-medium text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => handleDelete(provider.id)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingProvider ? 'Editar' : 'Crear'} Proveedor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-700">Nombre (Obligatorio)</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" required />
              </div>
              <div>
                <label htmlFor="rif" className="block mb-2 text-sm font-medium text-slate-700">RIF</label>
                <input type="text" name="rif" id="rif" value={formData.rif} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label htmlFor="address" className="block mb-2 text-sm font-medium text-slate-700">Dirección</label>
                <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"></textarea>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingProvider ? 'Guardar Cambios' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}