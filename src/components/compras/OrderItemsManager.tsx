import React, { useState, useEffect, useMemo } from 'react';
import { useOrderFormStore, type FormOrderItem } from '../../stores/orderFormStore';
import { useMasterDataStore } from '../../stores/masterDataStore';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

export default function OrderItemsManager() {
  const { data: orderData, setData: setOrderData } = useOrderFormStore();
  const { products, fetchProducts } = useMasterDataStore();

  const [currentItem, setCurrentItem] = useState({ description: '', unit: '', quantity: 1, unitPrice: 0 });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  useEffect(() => {
    const baseAmount = orderData.items.reduce((acc, item) => acc + item.total, 0);
    const ivaAmount = baseAmount * 0.16;
    const totalAmount = baseAmount + ivaAmount;
    setOrderData({ baseAmount, ivaAmount, totalAmount });
  }, [orderData.items, setOrderData]);

  const activeProducts = useMemo(() => products.filter(p => p.isActive), [products]);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = parseInt(e.target.value, 10);
    const product = activeProducts.find(p => p.id === productId);
    if (product) {
      setCurrentItem(prev => ({ ...prev, description: product.name, unit: product.unit }));
    }
  };

  const handleAddItem = () => {
    if (!currentItem.description || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      alert('Descripción, cantidad y precio unitario son requeridos y deben ser mayores a cero.');
      return;
    }
    const newItem: FormOrderItem = {
      ...currentItem,
      total: currentItem.quantity * currentItem.unitPrice,
    };
    setOrderData({ items: [...orderData.items, newItem] });
    setCurrentItem({ description: '', unit: '', quantity: 1, unitPrice: 0 });
  };

  const handleUpdateItem = () => {
    if (editingIndex === null) return;
    const updatedItem: FormOrderItem = {
      ...currentItem,
      total: currentItem.quantity * currentItem.unitPrice,
    };
    const updatedItems = [...orderData.items];
    updatedItems[editingIndex] = updatedItem;
    setOrderData({ items: updatedItems });
    setCurrentItem({ description: '', unit: '', quantity: 1, unitPrice: 0 });
    setEditingIndex(null);
  };

  const handleEdit = (item: FormOrderItem, index: number) => {
    setEditingIndex(index);
    setCurrentItem(item);
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
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Agregar Ítems a la Orden</h3>
        <div className="p-4 border rounded-lg space-y-4 bg-slate-50">
          <Select label="Seleccionar Producto (Opcional)" options={activeProducts} onChange={handleProductSelect} value="" helperText="Autocompletará la descripción y la unidad." />
          <Textarea label="Descripción" required value={currentItem.description} onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Unidad" required value={currentItem.unit} onChange={(e) => setCurrentItem(prev => ({ ...prev, unit: e.target.value }))} />
            <Input label="Cantidad" type="number" required value={currentItem.quantity} onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))} />
            <Input label="Precio Unitario" type="number" required value={currentItem.unitPrice} onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="text-right">
            <button type="button" onClick={isEditing ? handleUpdateItem : handleAddItem} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              {isEditing ? 'Actualizar Ítem' : 'Agregar Ítem'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setEditingIndex(null); setCurrentItem({ description: '', unit: '', quantity: 1, unitPrice: 0 }); }} className="px-4 py-2 ml-2 bg-slate-200 rounded-lg hover:bg-slate-300">
                Cancelar Edición
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Ítems Agregados</h3>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Descripción</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3">Cantidad</th>
                <th className="px-6 py-3">Precio Unit.</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orderData.items.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4">Aún no se han agregado ítems.</td></tr>
              ) : (
                orderData.items.map((item, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.description}</td>
                    <td className="px-6 py-4">{item.unit}</td>
                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4 font-mono">{item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-right">{item.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(item, index)} className="font-medium text-blue-600 hover:underline">Editar</button>
                      <button onClick={() => handleDelete(index)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {orderData.items.length > 0 && (
              <tfoot className="bg-slate-100 font-semibold">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-slate-900">Subtotal</td>
                  <td className="px-6 py-3 text-slate-900 text-right font-mono">{orderData.baseAmount.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-slate-900">IVA (16%)</td>
                  <td className="px-6 py-3 text-slate-900 text-right font-mono">{orderData.ivaAmount.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-slate-900 text-lg">Total General</td>
                  <td className="px-6 py-3 text-slate-900 text-lg text-right font-mono">{orderData.totalAmount.toFixed(2)}</td>
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