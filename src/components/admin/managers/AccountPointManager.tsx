import React, { useEffect, useCallback } from 'react';
import type { AccountPoint } from '../../../utils/api';
import { useMasterDataStore } from '../../../stores/masterDataStore';
import GenericCRUDManager from './GenericCRUDManager';
import TableSkeleton from '../../ui/TableSkeleton';
import Alert from '../../ui/Alert';

export default function AccountPointManager() {
  // --- SOLUCIÓN ---
  // 1. Selecciona solo las partes del estado que son reactivas y que cambian.
  const accountPoints = useMasterDataStore(state => state.accountPoints);
  const isLoading = useMasterDataStore(state => state.loading.accountPoints);
  const errorMessage = useMasterDataStore(state => state.error.accountPoints);

  // 2. Obtén las acciones (que son estables) una vez usando getState().
  //    Esto evita que se pasen como nuevas referencias en cada render.
  const { createAccountPoint, updateAccountPoint, deleteAccountPoint, fetchAccountPoints } = useMasterDataStore.getState();

  useEffect(() => {
    if (accountPoints.length === 0) {
      fetchAccountPoints();
    }
  }, [fetchAccountPoints, accountPoints.length]);

  const handleRetry = useCallback(() => {
    fetchAccountPoints(true);
  }, [fetchAccountPoints]);
  
  // Usamos 'isLoading' que viene del store para el estado de carga inicial.
  if (isLoading && accountPoints.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gestión de Puntos de Cuenta</h2>
          <div className="h-10 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        </div>
        <TableSkeleton columns={5} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mt-6">
        <Alert title="Ocurrió un error al cargar los Puntos de Cuenta" variant="danger">
          <p>{errorMessage}</p>
          <div className="mt-4">
            <button
                onClick={handleRetry}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Reintentar
              </button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <GenericCRUDManager<AccountPoint>
      title="Gestión de Puntos de Cuenta"
      itemNoun="Punto de Cuenta"
      items={accountPoints}
      api={{ create: createAccountPoint, update: updateAccountPoint, delete: deleteAccountPoint }}
      onRefresh={() => fetchAccountPoints(true)}
      getInitialFormData={(item) => ({
        date: item?.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
        subject: item?.subject || '',
        synthesis: item?.synthesis || '',
        programmaticCategory: item?.programmaticCategory || '',
        uel: item?.uel || '',
      })}
      tableHeaders={(
        <tr>
          <th className="px-6 py-3">Número</th>
          <th className="px-6 py-3">Fecha</th>
          <th className="px-6 py-3">Asunto</th>
          <th className="px-6 py-3">Estado</th>
          <th className="px-6 py-3 text-right">Acciones</th>
        </tr>
      )}
      renderTableRow={(item, handleEdit, handleDelete) => (
        <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
          <td className="px-6 py-4 font-medium text-slate-900">{item.accountNumber}</td>
          <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('es-VE')}</td>
          <td className="px-6 py-4 max-w-sm truncate" title={item.subject}>{item.subject}</td>
          <td className="px-6 py-4">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
              {item.status}
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
            <label htmlFor="date" className="block mb-2 text-sm font-medium text-slate-700">Fecha</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" required />
          </div>
          <div>
            <label htmlFor="subject" className="block mb-2 text-sm font-medium text-slate-700">Asunto</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" required />
          </div>
          <div>
            <label htmlFor="synthesis" className="block mb-2 text-sm font-medium text-slate-700">Síntesis</label>
            <textarea name="synthesis" value={formData.synthesis} onChange={handleChange} rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"></textarea>
          </div>
          <div>
            <label htmlFor="programmaticCategory" className="block mb-2 text-sm font-medium text-slate-700">Categoría Programática</label>
            <input type="text" name="programmaticCategory" value={formData.programmaticCategory} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label htmlFor="uel" className="block mb-2 text-sm font-medium text-slate-700">UEL</label>
            <input type="text" name="uel" value={formData.uel} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
          </div>
        </>
      )}
    />
  );
}