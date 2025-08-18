import React from 'react';
import type { Position } from '../../../utils/api';
import { getPositions, createPosition, updatePosition, deletePosition } from '../../../utils/api';
import GenericCRUDManager from './GenericCRUDManager';

export default function PositionsManager({ initialPositions }: { initialPositions: Position[] }) {
  return (
    <GenericCRUDManager<Position>
      title="Cargos"
      itemNoun="Cargo"
      initialItems={initialPositions}
      api={{ getAll: getPositions, create: createPosition, update: updatePosition, delete: deletePosition }}
      getInitialFormData={(item) => ({ name: item?.name || '', isActive: item?.isActive ?? true })}
      
      tableHeaders={(
        <tr>
          <th className="px-6 py-3">Nombre del Cargo</th>
          <th className="px-6 py-3">Estado</th>
          <th className="px-6 py-3 text-right">Acciones</th>
        </tr>
      )}

      renderTableRow={(item, handleEdit, handleDelete) => (
        <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
          <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.isActive ? 'Activo' : 'Inactivo'}
              </span>
          </td>
          <td className="px-6 py-4 text-right space-x-2">
            <button onClick={() => handleEdit(item)} className="font-medium text-blue-600 hover:underline">Editar</button>
            <button onClick={() => handleDelete(item)} className="font-medium text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
      )}

      renderFormFields={(formData, handleChange) => (
        <>
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-700">Nombre del Cargo</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" required />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-slate-700">Activo</label>
          </div>
        </>
      )}
    />
  );
}