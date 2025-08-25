import React, { useState, useEffect, useMemo } from 'react';
import {
  useOrderFormStore,
  type FormOrderItem,
} from '../../stores/orderFormStore';
import { useMasterDataStore } from '../../stores/masterDataStore';
import { useSettingsStore } from '../../stores/settingsStore';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

const INITIAL_ITEM_STATE = {
  description: '',
  unit: '',
  quantity: 1,
  unitPrice: '',
  appliesIva: true,
};

export default function OrderItemsManager() {
  const { data: orderData, setData: setOrderData } = useOrderFormStore();
  const { products, fetchProducts } = useMasterDataStore();
  const { ivaPercentage, isLoading: isLoadingIva, fetchIvaPercentage } = useSettingsStore();

  const [currentItem, setCurrentItem] = useState(INITIAL_ITEM_STATE);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
    fetchIvaPercentage();
  }, [fetchProducts, products.length, fetchIvaPercentage]);

  useEffect(() => {
    const baseAmount = orderData.items.reduce(
      (acc, item) => acc + item.total,
      0
    );
    const ivaBaseAmount = orderData.items.reduce((acc, item) => {
      return item.appliesIva ? acc + item.total : acc;
    }, 0);
    const ivaRate = ivaPercentage / 100;
    const ivaAmount = ivaBaseAmount * ivaRate;
    const totalAmount = baseAmount + ivaAmount;
    setOrderData({ baseAmount, ivaAmount, totalAmount });
  }, [orderData.items, setOrderData, ivaPercentage]);

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
      alert(
        'Descripción, cantidad y precio unitario son requeridos y deben ser mayores a cero.'
      );
      return;
    }

    const newItem: FormOrderItem = {
      description: currentItem.description,
      unit: currentItem.unit,
      quantity,
      unitPrice,
      appliesIva: currentItem.appliesIva,
      total: quantity * unitPrice,
    };

    if (editingIndex !== null) {
      const updatedItems = [...orderData.items];
      updatedItems[editingIndex] = newItem;
      setOrderData({ items: updatedItems });
      setEditingIndex(null);
    } else {
      setOrderData({ items: [...orderData.items, newItem] });
    }

    setCurrentItem(INITIAL_ITEM_STATE);
  };

  const handleEdit = (item: FormOrderItem, index: number) => {
    setEditingIndex(index);
    setCurrentItem({
      ...item,
      unitPrice: String(item.unitPrice),
    });
  };

  const handleDelete = (index: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este ítem?')) {
      const updatedItems = orderData.items.filter((_, i) => i !== index);
      setOrderData({ items: updatedItems });
    }
  };

  const isEditing = editingIndex !== null;

  return (
    <div className="space-y-6">
      <div>
        {/* CAMBIO: Contenedor del título con el indicador de IVA */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Agregar Ítems a la Orden
          </h3>
          {isLoadingIva ? (
            <div className="h-6 w-28 bg-slate-200 rounded-md animate-pulse"></div>
          ) : (
            <div className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-md">
              IVA Aplicable: {ivaPercentage}%
            </div>
          )}
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
            required
            value={currentItem.description}
            onChange={(e) =>
              setCurrentItem((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Unidad"
              required
              value={currentItem.unit}
              onChange={(e) =>
                setCurrentItem((prev) => ({ ...prev, unit: e.target.value }))
              }
            />
            <Input
              label="Cantidad"
              type="number"
              required
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
              required
              placeholder="0.00"
              step="0.01"
              min="0.01"
              value={currentItem.unitPrice}
              onChange={(e) =>
                setCurrentItem((prev) => ({ ...prev, unitPrice: e.target.value }))
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
              {orderData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Aún no se han agregado ítems.
                  </td>
                </tr>
              ) : (
                orderData.items.map((item, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4">{item.unit}</td>
                    <td className="px-6 py-4">{item.appliesIva ? 'Sí' : 'No'}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4 font-mono">
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono text-right">
                      {item.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item, index)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
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
            {orderData.items.length > 0 && (
              <tfoot className="bg-slate-100 font-semibold">
                <tr>
                  <td colSpan={5} className="px-6 py-3 text-right text-slate-900">
                    Subtotal
                  </td>
                  <td className="px-6 py-3 text-slate-900 text-right font-mono">
                    {orderData.baseAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={5} className="px-6 py-3 text-right text-slate-900">
                    IVA ({ivaPercentage}%)
                  </td>
                  <td className="px-6 py-3 text-slate-900 text-right font-mono">
                    {orderData.ivaAmount.toFixed(2)}
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
                    {orderData.totalAmount.toFixed(2)}
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