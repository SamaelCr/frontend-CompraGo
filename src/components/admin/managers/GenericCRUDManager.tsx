import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '../../ui/ConfirmModal';

// T ahora debe tener 'id' y opcionalmente 'name' o 'fullName' para mostrar en el modal
interface GenericCRUDManagerProps<T extends { id: number; name?: string; fullName?: string }> {
  title: string;
  itemNoun: string;
  initialItems: T[];
  api: {
    getAll: () => Promise<T[]>;
    create: (data: any) => Promise<T>;
    update: (id: number, data: any) => Promise<T>;
    delete: (id: number) => Promise<void>;
  };
  tableHeaders: React.ReactNode;
  renderTableRow: (item: T, handleEdit: (item: T) => void, handleDelete: (item: T) => void) => React.ReactNode;
  renderFormFields: (formData: any, handleChange: (e: any) => void) => React.ReactNode;
  getInitialFormData: (item: T | null) => any;
}

export default function GenericCRUDManager<T extends { id: number; name?: string; fullName?: string }>({
  title,
  itemNoun,
  initialItems,
  api,
  tableHeaders,
  renderTableRow,
  renderFormFields,
  getInitialFormData,
}: GenericCRUDManagerProps<T>) {
  const [items, setItems] = useState(initialItems);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<any>(getInitialFormData(null));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  const fetchItems = async () => {
    try {
      const data = await api.getAll();
      setItems(data);
    } catch (err) {
      setError(`Error al cargar ${itemNoun.toLowerCase()}s.`);
    }
  };

  const handleOpenFormModal = (item: T | null = null) => {
    setError(null);
    setEditingItem(item);
    setFormData(getInitialFormData(item));
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    const finalValue = isCheckbox ? e.target.checked : value;
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      if (editingItem) {
        await api.update(editingItem.id, formData);
      } else {
        await api.create(formData);
      }
      toast.success(`${itemNoun} guardado con éxito.`);
      await fetchItems();
      handleCloseFormModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Ocurrió un error al guardar el ${itemNoun.toLowerCase()}.`;
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = (item: T) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const confirmDeletion = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    // Cerramos el modal inmediatamente para dar paso a los toasts
    setIsConfirmModalOpen(false);

    // Creamos la promesa que se encargará de la lógica
    const deletePromise = api.delete(itemToDelete.id).then(async () => {
      // Si la API tuvo éxito, recargamos la tabla
      await fetchItems();
    });

    // `toast.promise` manejará automáticamente los toasts de carga, éxito y error
    toast.promise(deletePromise, {
      pending: `Eliminando ${itemNoun.toLowerCase()}...`,
      success: `${itemNoun} eliminado con éxito.`,
      // 👇 La clave está aquí: el mensaje de error viene de la promesa rechazada
      error: {
        render({ data }) {
          // 'data' es el error que lanzamos desde api.ts
          if (data instanceof Error) {
            return data.message;
          }
          return `Error al eliminar el ${itemNoun.toLowerCase()}.`;
        }
      }
    });

    // Limpiamos el estado al finalizar
    deletePromise.finally(() => {
        setItemToDelete(null);
        setIsLoading(false);
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button onClick={() => handleOpenFormModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Crear {itemNoun}
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">{tableHeaders}</thead>
          <tbody>
            {items.map((item) => renderTableRow(item, handleOpenFormModal, handleDeleteRequest))}
          </tbody>
        </table>
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Editar' : 'Crear'} {itemNoun}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFormFields(formData, handleChange)}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseFormModal} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                  {isLoading ? 'Guardando...' : (editingItem ? 'Guardar Cambios' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeletion}
        title={`Eliminar ${itemNoun}`}
        description={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name || itemToDelete?.fullName}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        intent="danger"
        isLoading={isLoading}
      />
    </div>
  );
}