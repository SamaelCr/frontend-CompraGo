import React from 'react';
import type { Official } from '../../../utils/api';
import { useMasterDataStore } from '../../../stores/masterDataStore';
import GenericCRUDManager from './GenericCRUDManager';

export default function OfficialsManager({ isInitialLoading }: { isInitialLoading?: boolean }) {
  const { officials, units, positions, createOfficial, updateOfficial, deleteOfficial, fetchOfficials } = useMasterDataStore();

  const activeUnits = units.filter(u => u.isActive);
  const activePositions = positions.filter(p => p.isActive);

  const transformFormData = (data: any) => {
    return {
      ...data,
      unitId: parseInt(data.unitId, 10),
      positionId: parseInt(data.positionId, 10)
    };
  };

  const apiWithTransformation = {
    create: (data: any) => createOfficial(transformFormData(data)),
    update: (id: number, data: any) => updateOfficial(id, transformFormData(data)),
    delete: deleteOfficial,
  };

  return (
    <GenericCRUDManager<Official>
      title="Funcionarios"
      itemNoun="Funcionario"
      items={officials}
      api={apiWithTransformation}
      onRefresh={() => fetchOfficials(true)}
      isInitialLoading={isInitialLoading}
      tableColumnCount={5}
      getInitialFormData={(item) => ({
        fullName: item?.fullName || '',
        unitId: item?.unitId?.toString() || (activeUnits.length > 0 ? activeUnits[0].id.toString() : '0'),
        positionId: item?.positionId?.toString() || (activePositions.length > 0 ? activePositions[0].id.toString() : '0'),
        isActive: item?.isActive ?? true,
      })}

      tableHeaders={(
        <tr>
          <th className="px-6 py-3">Nombre Completo</th>
          <th className="px-6 py-3">Unidad</th>
          <th className="px-6 py-3">Cargo</th>
          <th className="px-6 py-3">Estado</th>
          <th className="px-6 py-3 text-right">Acciones</th>
        </tr>
      )}

      renderTableRow={(item, handleEdit, handleDelete) => (
        <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
          <td className="px-6 py-4 font-medium text-slate-900">{item.fullName}</td>
          <td className="px-6 py-4">{item.unit.name}</td>
          <td className="px-6 py-4">{item.position.name}</td>
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
            <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-slate-700">Nombre Completo</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" required />
          </div>
          <div>
            <label htmlFor="unitId" className="block mb-2 text-sm font-medium text-slate-700">Unidad</label>
            <select name="unitId" value={formData.unitId} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" required>
              {activeUnits.map(unit => <option key={unit.id} value={unit.id.toString()}>{unit.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="positionId" className="block mb-2 text-sm font-medium text-slate-700">Cargo</label>
            <select name="positionId" value={formData.positionId} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" required>
              {activePositions.map(pos => <option key={pos.id} value={pos.id.toString()}>{pos.name}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-slate-700">Activo</label>
          </div>
        </>
      )}
    />
  );
}