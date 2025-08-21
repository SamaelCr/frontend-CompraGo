import React, { useEffect, useCallback } from 'react';
import type { Provider } from '../../utils/api';
import { useMasterDataStore } from '../../stores/masterDataStore';
import GenericCRUDManager from './managers/GenericCRUDManager';
import TableSkeleton from '../ui/TableSkeleton';
import Alert from '../ui/Alert'; // CAMBIO: Importa el nuevo Alert.tsx

export default function ProviderManager() {
  const providers = useMasterDataStore(state => state.providers);
  const isLoading = useMasterDataStore(state => state.loading.providers);
  const errorMessage = useMasterDataStore(state => state.error.providers);

  const { createProvider, updateProvider, deleteProvider, fetchProviders } = useMasterDataStore.getState();

  useEffect(() => {
    if (providers.length === 0) {
      fetchProviders();
    }
  }, [fetchProviders, providers.length]);

  const handleRetry = useCallback(() => {
    fetchProviders(true);
  }, [fetchProviders]);
  
  if (isLoading && providers.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Proveedores</h2>
          <div className="h-10 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        </div>
        <TableSkeleton columns={4} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-6">
        <Alert title="Ocurrió un error al cargar los proveedores" variant="danger">
          <p>{errorMessage}</p>
          <div className="mt-4">
            {/* CAMBIO: Usamos un botón HTML normal con clases de Tailwind */}
            <button
                onClick={handleRetry}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Reintentar
              </button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <GenericCRUDManager<Provider>
      title="Gestión de Proveedores"
      itemNoun="Proveedor"
      items={providers}
      api={{
        create: createProvider,
        update: updateProvider,
        delete: deleteProvider,
      }}
      onRefresh={() => fetchProviders(true)}
      getInitialFormData={(item) => ({
        name: item?.name || '',
        rif: item?.rif || '',
        address: item?.address || '',
      })}
      tableHeaders={(
        <tr>
          <th className="px-6 py-3">Nombre</th>
          <th className="px-6 py-3">RIF</th>
          <th className="px-6 py-3">Dirección</th>
          <th className="px-6 py-3 text-right">Acciones</th>
        </tr>
      )}
      renderTableRow={(item, handleEdit, handleDelete) => (
        <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
          <td className="px-6 py-4">{item.rif}</td>
          <td className="px-6 py-4 max-w-sm truncate">{item.address}</td>
          <td className="px-6 py-4 text-right space-x-2">
            <button onClick={() => handleEdit(item)} className="font-medium text-blue-600 hover:underline">Editar</button>
            <button onClick={() => handleDelete(item)} className="font-medium text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
      )}
      renderFormFields={(formData, handleChange) => (
        <>
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
        </>
      )}
    />
  );
}