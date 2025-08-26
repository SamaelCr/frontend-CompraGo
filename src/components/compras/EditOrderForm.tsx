import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { ApiOrder, UpdateOrderPayload, OrderItem } from '../../utils/api';
import { updateOrder } from '../../utils/api';
import { useMasterDataStore } from '../../stores/masterDataStore';
import { useOrderFormStore } from '../../stores/orderFormStore';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import OrderItemsManager from './OrderItemsManager';

interface Props {
  initialOrder: ApiOrder;
}

export default function EditOrderForm({ initialOrder }: Props) {
  const [orderData, setOrderData] = useState<ApiOrder>(initialOrder);
  const [isLoading, setIsLoading] = useState(false);
  const { setData } = useOrderFormStore.getState();

  const [ivaInput, setIvaInput] = useState<string>(
    initialOrder.ivaPercentage.toString()
  );

  const {
    units,
    officials,
    providers,
    accountPoints,
    fetchUnits,
    fetchOfficials,
    fetchProviders,
    fetchAccountPoints,
  } = useMasterDataStore();

  useEffect(() => {
    setData({
      formContext: { type: 'edit', orderId: initialOrder.id },
      ...initialOrder,
      // CAMBIO: Aseguramos que `items` nunca sea `null` al pasarlo al store.
      items: initialOrder.items ?? [],
    });

    if (units.length === 0) fetchUnits();
    if (officials.length === 0) fetchOfficials();
    if (providers.length === 0) fetchProviders();
    if (accountPoints.length === 0) fetchAccountPoints();
  }, [
    initialOrder,
    setData,
    units,
    officials,
    providers,
    accountPoints,
    fetchUnits,
    fetchOfficials,
    fetchProviders,
    fetchAccountPoints,
  ]);

  const handleFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const finalValue = type === 'checkbox' ? e.target.checked : value;
    setOrderData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleItemsChange = (items: OrderItem[]) => {
    setOrderData((prev) => ({ ...prev, items }));
  };

  const handleIvaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIvaInput(e.target.value);
  };

  useEffect(() => {
    const newIva = parseFloat(ivaInput) || 0;
    setOrderData((prev) => ({ ...prev, ivaPercentage: newIva }));
  }, [ivaInput]);

  useEffect(() => {
    const ivaRate = orderData.ivaPercentage / 100.0;
    const items = orderData.items || [];
    const baseAmount = items.reduce((acc, item) => acc + item.total, 0);
    const ivaBaseAmount = items.reduce((acc, item) => {
      return item.appliesIva ? acc + item.total : acc;
    }, 0);
    const ivaAmount = ivaBaseAmount * ivaRate;
    const totalAmount = baseAmount + ivaAmount;
    setOrderData((prev) => ({ ...prev, baseAmount, ivaAmount, totalAmount }));
  }, [orderData.items, orderData.ivaPercentage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderData.items || orderData.items.length === 0) {
      toast.error('La orden debe tener al menos un ítem para poder guardarla.');
      return;
    }

    setIsLoading(true);

    const payload: UpdateOrderPayload = {
      memoDate: orderData.memoDate.split('T')[0],
      requestingUnit: orderData.requestingUnit,
      responsibleOfficial: orderData.responsibleOfficial,
      concept: orderData.concept,
      provider: orderData.provider,
      documentType: orderData.documentType,
      budgetNumber: orderData.budgetNumber,
      budgetDate: orderData.budgetDate.split('T')[0],
      deliveryTime: orderData.deliveryTime,
      offerQuality: orderData.offerQuality,
      priceInquiryType: orderData.priceInquiryType,
      observations: orderData.observations,
      hasIvaRetention: orderData.hasIvaRetention,
      hasIslr: orderData.hasIslr,
      hasItf: orderData.hasItf,
      signedById: orderData.signedById,
      accountPointId: orderData.accountPointId,
      ivaPercentage: orderData.ivaPercentage,
      status: orderData.status,
      items: (orderData.items || []).map(
        ({ description, unit, quantity, unitPrice, appliesIva }) => ({
          description,
          unit,
          quantity,
          unitPrice,
          appliesIva,
        })
      ),
    };

    const updatePromise = updateOrder(orderData.id, payload);

    toast.promise(updatePromise, {
      pending: 'Actualizando orden...',
      success: '¡Orden actualizada con éxito! Redirigiendo...',
      error: {
        render: ({ data }) => {
          const message =
            data instanceof Error
              ? data.message
              : 'No se pudo actualizar la orden.';
          return message;
        },
      },
    });

    updatePromise
      .then(() => {
        useOrderFormStore.getState().reset();
        setTimeout(() => {
          window.location.href = `/compras/${orderData.id}`;
        }, 1500);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card title="Paso 1: Requisición">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Fecha del Memorando" type="date" name="memoDate" value={orderData.memoDate.split('T')[0]} onChange={handleFieldChange} required />
          <Input label="Número del Memorando" value={orderData.memoNumber} disabled />
          <Input label="Unidad Solicitante" name="requestingUnit" value={orderData.requestingUnit} onChange={handleFieldChange} required />
          <Input label="Funcionario Responsable" name="responsibleOfficial" value={orderData.responsibleOfficial} onChange={handleFieldChange} required />
          <div className="md:col-span-2">
            <Textarea label="Concepto" name="concept" value={orderData.concept} onChange={handleFieldChange} rows={3} required />
          </div>
        </div>
      </Card>

      <Card title="Paso 2: Cotización">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Proveedor" name="provider" value={orderData.provider} onChange={handleFieldChange} required />
          <Input label="Nro. Presupuesto" name="budgetNumber" value={orderData.budgetNumber} onChange={handleFieldChange} required />
          <Input label="Fecha Presupuesto" type="date" name="budgetDate" value={orderData.budgetDate.split('T')[0]} onChange={handleFieldChange} required />
          <Select label="Tipo Documento" name="documentType" value={orderData.documentType} onChange={handleFieldChange} options={['Presupuesto', 'Factura Proforma']} required />
          <Select label="Calidad Oferta" name="offerQuality" value={orderData.offerQuality} onChange={handleFieldChange} options={['Alta', 'Media', 'Baja']} required />
          <Select label="Tiempo de Entrega" name="deliveryTime" value={orderData.deliveryTime} onChange={handleFieldChange} options={['5 días', '15 días', '30 días', 'Inmediato']} required />
        </div>
      </Card>

      <Card title="Paso 3: Ítems y Finalización">
        <OrderItemsManager
          items={orderData.items || []}
          onItemsChange={handleItemsChange}
          ivaPercentageString={ivaInput}
          onIvaChange={handleIvaChange}
          isIvaEditable={true}
        />
        <div className="mt-8 pt-6 border-t space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Select label="Punto de Cuenta" name="accountPointId" value={orderData.accountPointId.toString()} onChange={handleFieldChange} options={accountPoints} labelKey="accountNumber" required />
                <Select label="Firmado Por" name="signedById" value={orderData.signedById.toString()} onChange={handleFieldChange} options={officials} labelKey="fullName" required />
                <Select label="Tipo de Consulta" name="priceInquiryType" value={orderData.priceInquiryType} onChange={handleFieldChange} options={["Compras", "Servicios"]} required />
                <Select label="Estado de la Orden" name="status" value={orderData.status} onChange={handleFieldChange} options={["En Proceso", "Completada", "Anulada"]} required />
            </div>
             <div>
                <Textarea label="Observaciones" name="observations" value={orderData.observations} onChange={handleFieldChange} rows={3}/>
            </div>
             <div>
                <h3 className="block mb-2 text-sm font-medium text-slate-700">Impuestos Adicionales</h3>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <input id="hasIvaRetention" type="checkbox" name="hasIvaRetention" checked={orderData.hasIvaRetention} onChange={handleFieldChange} className="w-4 h-4 text-blue-600"/>
                        <label htmlFor="hasIvaRetention" className="ml-2 text-sm font-medium">Retención de IVA</label>
                    </div>
                     <div className="flex items-center">
                        <input id="hasIslr" type="checkbox" name="hasIslr" checked={orderData.hasIslr} onChange={handleFieldChange} className="w-4 h-4 text-blue-600"/>
                        <label htmlFor="hasIslr" className="ml-2 text-sm font-medium">ISLR</label>
                    </div>
                     <div className="flex items-center">
                        <input id="hasItf" type="checkbox" name="hasItf" checked={orderData.hasItf} onChange={handleFieldChange} className="w-4 h-4 text-blue-600"/>
                        <label htmlFor="hasItf" className="ml-2 text-sm font-medium">ITF</label>
                    </div>
                </div>
            </div>
        </div>
      </Card>

       <div className="mt-8 pt-6 border-t flex justify-end">
        <button type="submit" disabled={isLoading} className="px-6 py-3 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400">
          {isLoading ? 'Guardando...' : 'Guardar Cambios en la Orden'}
        </button>
      </div>
    </form>
  );
}