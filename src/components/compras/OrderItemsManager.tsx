import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { OrderItem } from '../../utils/api';
import { useMasterDataStore } from '../../stores/masterDataStore';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

interface Props {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  ivaPercentageString: string;
  onIvaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isIvaEditable?: boolean;
}

const INITIAL_ITEM_STATE = {
  description: '',
  unit: '',
  quantity: 1,
  unitPrice: '',
  appliesIva: true,
};

export default function OrderItemsManager({
  items,
  onItemsChange,
  ivaPercentageString,
  onIvaChange,
  isIvaEditable = true,
}: Props) {
  const { products, fetchProducts } = useMasterDataStore();

  const [currentItem, setCurrentItem] = useState(INITIAL_ITEM_STATE);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive),
    [products]
  );

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = parseInt(e.target.value, 10);
    const product = activeProducts.find((p) => p.id === productId);
    if (product) {
      setCurrentItem((prev) => ({
        ...prev,
        description: product.name,
        unit: product.unit,
        appliesIva: product.appliesIva,
      }));
    }
  };

  const handleItemAction = () => {
    const quantity = Number(currentItem.quantity) || 0;
    const unitPrice = Number(currentItem.unitPrice) || 0;

    if (!currentItem.description || quantity <= 0 || unitPrice <= 0) {
      toast.error(
        'Descripción, cantidad y precio unitario son requeridos y deben ser mayores a cero.'
      );
      return;
    }

    const newItem: OrderItem = {
      description: currentItem.description,
      unit: currentItem.unit,
      quantity,
      unitPrice,
      appliesIva: currentItem.appliesIva,
      total: quantity * unitPrice,
    };

    if (editingIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editingIndex] = newItem;
      onItemsChange(updatedItems);
      setEditingIndex(null);
    } else {
      onItemsChange([...items, newItem]);
    }

    setCurrentItem(INITIAL_ITEM_STATE);
  };

  const handleEdit = (item: OrderItem, index: number) => {
    setEditingIndex(index);
    setCurrentItem({
      ...item,
      unitPrice: String(item.unitPrice),
    });
  };

  const handleDelete = (index: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este ítem?')) {
      const updatedItems = items.filter((_, i) => i !== index);
      onItemsChange(updatedItems);
    }
  };

  const ivaPercentage = parseFloat(ivaPercentageString) || 0;
  const baseAmount = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);
  const ivaBaseAmount = useMemo(() => items.reduce((acc, item) => item.appliesIva ? acc + item.total : acc, 0), [items]);
  const ivaAmount = useMemo(() => ivaBaseAmount * (ivaPercentage / 100), [ivaBaseAmount, ivaPercentage]);
  const totalAmount = useMemo(() => baseAmount + ivaAmount, [baseAmount, ivaAmount]);
  
  const isEditing = editingIndex !== null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Ítems de la Orden
          </h3>
          <div className="flex items-center gap-2">
            <label htmlFor="ivaPercentage" className="text-sm font-medium">
              IVA Aplicable (%):
            </label>
            <Input
              id="ivaPercentage"
              type="number"
              step="0.01"
              value={ivaPercentageString}
              onChange={onIvaChange}
              className="w-24 text-right"
              label=""
              disabled={!isIvaEditable}
            />
          </div>
        </div>
        <div className="p-4 border rounded-lg space-y-4 bg-slate-50">
          <Select
            label="Seleccionar Producto (Opcional)"
            options={activeProducts}
            onChange={handleProductSelect}
            value=""
            helperText="Autocompletará la descripción, la unidad y si aplica IVA."
          />
          <Textarea
            label="Descripción"
            // CAMBIO: Eliminado `required`
            value={currentItem.description}
            onChange={(e) =>
              setCurrentItem((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Unidad"
              // CAMBIO: Eliminado `required`
              value={currentItem.unit}
              onChange={(e) =>
                setCurrentItem((prev) => ({ ...prev, unit: e.target.value }))
              }
            />
            <Input
              label="Cantidad"
              type="number"
              // CAMBIO: Eliminado `required`
              min="1"
              value={currentItem.quantity}
              onChange={(e) =>
                setCurrentItem((prev) => ({
                  ...prev,
                  quantity: parseFloat(e.target.value) || 1,
                }))
              }
            />
            <Input
              label="Precio Unitario"
              type="number"
              // CAMBIO: Eliminado `required`
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={currentItem.unitPrice}
              onChange={(e) =>
                setCurrentItem((prev) => ({
                  ...prev,
                  unitPrice: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center">
              <input
                id="appliesIva"
                type="checkbox"
                checked={currentItem.appliesIva}
                onChange={(e) =>
                  setCurrentItem((prev) => ({
                    ...prev,
                    appliesIva: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="appliesIva"
                className="ml-2 text-sm font-medium text-slate-700"
              >
                Aplica IVA
              </label>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={handleItemAction}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Actualizar Ítem' : 'Agregar Ítem'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    setCurrentItem(INITIAL_ITEM_STATE);
                  }}
                  className="px-4 py-2 ml-2 bg-slate-200 rounded-lg hover:bg-slate-300"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">
          Ítems Agregados
        </h3>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Aplica IVA</th>
                <th className="px-6 py-3">Cantidad</th>
                <th className="px-6 py-3">Precio Unit.</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Aún no se han agregado ítems.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4">{item.unit}</td>
                    <td className="px-6 py-4">
                      {item.appliesIva ? 'Sí' : 'No'}
                    </td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4 font-mono">
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono text-right">
                      {item.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item, index)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot className="bg-slate-100 font-semibold">
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-3 text-right text-slate-900"
                  >
                    Subtotal
                  </td>
                  <td className="px-6 py-3 text-slate-900 text-right font-mono">
                    {baseAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-3 text-right text-slate-900"
                  >
                    IVA ({ivaPercentage}%)
                  </td>
                  <td className="px-6 py-3 text-slate-900 text-right font-mono">
                    {ivaAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-3 text-right text-slate-900 text-lg"
                  >
                    Total General
                  </td>
                  <td className="px-6 py-3 text-slate-900 text-lg text-right font-mono">
                    {totalAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}