import React, { useState } from 'react';

interface GenericCRUDManagerProps<T extends { id: number }> {
  title: string;
  itemNoun: string;
  initialItems: T[];
  api: {
    getAll: () => Promise<T[]>;
    create: (data: any) => Promise<T>;
    update: (id: number, data: any) => Promise<T>;
  };
  tableHeaders: React.ReactNode;
  renderTableRow: (item: T, handleEdit: (item: T) => void) => React.ReactNode;
  renderFormFields: (formData: any, handleChange: (e: any) => void) => React.ReactNode;
  getInitialFormData: (item: T | null) => any;
}

export default function GenericCRUDManager<T extends { id: number }>({
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<any>(getInitialFormData(null));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = async () => {
    try {
      const data = await api.getAll();
      setItems(data);
    } catch (err) {
      setError(`Error al cargar ${itemNoun.toLowerCase()}s.`);
    }
  };

  const handleOpenModal = (item: T | null = null) => {
    setError(null);
    setEditingItem(item);
    setFormData(getInitialFormData(item));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    if (isLoading) return; // Prevenir doble submit si ya se está procesando
    setIsLoading(true);
    setError(null);

    try {
      if (editingItem) {
        await api.update(editingItem.id, formData);
      } else {
        await api.create(formData);
      }
      await fetchItems();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Ocurrió un error al guardar el ${itemNoun.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Crear {itemNoun}
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            {tableHeaders}
          </thead>
          <tbody>
            {items.map((item) => renderTableRow(item, handleOpenModal))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? 'Editar' : 'Crear'} {itemNoun}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFormFields(formData, handleChange)}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                  {isLoading ? 'Guardando...' : (editingItem ? 'Guardar Cambios' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}