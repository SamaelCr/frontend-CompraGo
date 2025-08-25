import React, { useEffect, useCallback } from 'react';
import { z } from 'zod';
import type { Product } from '../../../utils/api';
import { useMasterDataStore } from '../../../stores/masterDataStore';
import GenericCRUDManager from './GenericCRUDManager';
import TableSkeleton from '../../ui/TableSkeleton';
import Alert from '../../ui/Alert';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  unit: z.string().min(1, 'Debe especificar una unidad.'),
  isActive: z.boolean(),
  appliesIva: z.boolean(),
});

export default function ProductManager({
  isInitialLoading: initialLoad, // Renombramos para evitar conflicto
}: {
  isInitialLoading?: boolean;
}) {
  // 1. Seleccionar solo los datos reactivos del store
  const products = useMasterDataStore((state) => state.products);
  const isLoading = useMasterDataStore((state) => state.loading.products);
  const errorMessage = useMasterDataStore((state) => state.error.products);

  // 2. Obtener las acciones (que son estables) una sola vez
  const { createProduct, updateProduct, deleteProduct, fetchProducts } =
    useMasterDataStore.getState();

  // 3. Efecto para cargar los datos si no están presentes
  useEffect(() => {
    // La lógica de `fetchProducts` ya previene cargas duplicadas,
    // así que podemos llamarla de forma segura.
    fetchProducts();
  }, [fetchProducts]);

  const handleRetry = useCallback(() => {
    fetchProducts(true); // Forzar recarga
  }, [fetchProducts]);

  // Mostrar esqueleto de carga si la data se está cargando por primera vez
  if (isLoading && products.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Productos y Servicios</h2>
          <div className="h-10 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        </div>
        <TableSkeleton columns={5} />
      </div>
    );
  }

  // Mostrar error si falló la carga
  if (errorMessage) {
    return (
      <div className="mt-6">
        <Alert
          title="Ocurrió un error al cargar los Productos"
          variant="danger"
        >
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
    <GenericCRUDManager<Product>
      title="Productos y Servicios"
      itemNoun="Producto/Servicio"
      items={products}
      api={{ create: createProduct, update: updateProduct, delete: deleteProduct }}
      onRefresh={() => fetchProducts(true)}
      tableColumnCount={5}
      validationSchema={productSchema}
      getInitialFormData={(item) => ({
        name: item?.name || '',
        unit: item?.unit || 'Unidad',
        isActive: item?.isActive ?? true,
        appliesIva: item?.appliesIva ?? true,
      })}
      tableHeaders={
        <tr>
          <th className="px-6 py-3">Nombre</th>
          <th className="px-6 py-3">Unidad por Defecto</th>
          <th className="px-6 py-3">Aplica IVA (Defecto)</th>
          <th className="px-6 py-3">Estado</th>
          <th className="px-6 py-3 text-right">Acciones</th>
        </tr>
      }
      renderTableRow={(item, handleEdit, handleDelete) => (
        <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
          <td className="px-6 py-4">{item.unit}</td>
          <td className="px-6 py-4">
            {item.appliesIva ? (
              <span className="text-green-600">Sí</span>
            ) : (
              <span className="text-slate-500">No</span>
            )}
          </td>
          <td className="px-6 py-4">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                item.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {item.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td className="px-6 py-4 text-right space-x-2">
            <button
              onClick={() => handleEdit(item)}
              className="font-medium text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(item)}
              className="font-medium text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </td>
        </tr>
      )}
      renderFormFields={(formData, handleChange) => (
        <>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-slate-700"
            >
              Nombre
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label
              htmlFor="unit"
              className="block mb-2 text-sm font-medium text-slate-700"
            >
              Unidad
            </label>
            <input
              type="text"
              name="unit"
              id="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              placeholder="Ej: Unidad, Servicio, Caja"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-slate-700"
              >
                Activo
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="appliesIva"
                id="appliesIva"
                checked={formData.appliesIva}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="appliesIva"
                className="ml-2 text-sm font-medium text-slate-700"
              >
                Aplica IVA
              </label>
            </div>
          </div>
        </>
      )}
    />
  );
}