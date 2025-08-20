import React from 'react';
import type { Provider } from '../../utils/api';
import { useMasterDataStore } from '../../stores/masterDataStore';
import GenericCRUDManager from './managers/GenericCRUDManager';

export default function ProviderManager() {
  const { providers, createProvider, updateProvider, deleteProvider, fetchProviders } = useMasterDataStore();

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