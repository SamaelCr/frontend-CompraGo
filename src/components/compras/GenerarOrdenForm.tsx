import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useMasterDataStore } from '../../stores/masterDataStore';
import { useOrderFormStore } from '../../stores/orderFormStore';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { type ApiOrder } from '../../utils/api';
import OrderItemsManager from './OrderItemsManager'; // Importamos el nuevo gestor

interface Props {
  onPrevStep: () => void;
}

export default function GenerarOrdenForm({ onPrevStep }: Props) {
  const { accountPoints, officials, fetchAccountPoints, fetchOfficials } = useMasterDataStore();
  const { data: orderData, setData: setOrderData, submitOrder, reset } = useOrderFormStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (accountPoints.length === 0) fetchAccountPoints();
    if (officials.length === 0) fetchOfficials();
  }, [fetchAccountPoints, fetchOfficials, accountPoints.length, officials.length]);

  const availableAccountPoints = accountPoints.filter(ap => ap.status === 'Disponible');
  const activeOfficials = officials.filter(o => o.isActive);

  const handleFinalSubmit = async () => {
    // Validaciones
    if (orderData.items.length === 0) {
      toast.error('Debe agregar al menos un ítem a la orden.');
      return;
    }
    if (!orderData.accountPointId) {
      toast.error('Debe seleccionar un Punto de Cuenta para continuar.');
      return;
    }
    if (!orderData.signedById) {
      toast.error('Debe seleccionar un funcionario que firme la orden.');
      return;
    }
    if (!orderData.priceInquiryType) {
      toast.error('Debe seleccionar el Tipo de Consulta.');
      return;
    }
    setIsLoading(true);

    const submissionPromise = submitOrder();

    toast.promise(submissionPromise, {
      pending: 'Creando orden...',
      success: {
        render: ({ data }) => {
          const newOrder = data as ApiOrder;
          reset();
          setTimeout(() => {
            window.location.href = `/compras/${newOrder.id}`;
          }, 1500);
          return '¡Orden creada con éxito! Redirigiendo...';
        },
      },
      error: {
        render: ({ data }) => {
          setIsLoading(false); 
          const message = data instanceof Error ? data.message : 'No se pudo crear la orden.';
          return message;
        }
      }
    });
  };

  return (
    <>
      {/* Renderizamos el gestor de ítems */}
      <OrderItemsManager />

      <div className="mt-8 pt-6 border-t space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Detalles Finales de la Orden</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Select
              label="Punto de Cuenta Asociado"
              options={availableAccountPoints}
              labelKey="accountNumber"
              value={orderData.accountPointId?.toString() || ''}
              onChange={(e) => setOrderData({ accountPointId: e.target.value ? parseInt(e.target.value, 10) : null })}
              helperText="Seleccione el punto de cuenta para esta orden."
              required
            />
            <Select
              label="Firmado Por"
              options={activeOfficials}
              labelKey="fullName"
              value={orderData.signedById?.toString() || ''}
              onChange={(e) => setOrderData({ signedById: e.target.value ? parseInt(e.target.value, 10) : null })}
              helperText="Funcionario que autoriza la orden."
              required
            />
            <Select
              label="Tipo de Consulta"
              options={["Compras", "Servicios"]}
              value={orderData.priceInquiryType}
              onChange={(e) => setOrderData({ priceInquiryType: e.target.value })}
              required
            />
          </div>
          <div>
            <Textarea
              label="Observaciones"
              rows={3}
              value={orderData.observations}
              onChange={(e) => setOrderData({ observations: e.target.value })}
              placeholder="Añada cualquier nota o detalle adicional que deba aparecer en la orden impresa..."
            />
          </div>
          <div>
            <h3 className="block mb-2 text-sm font-medium text-slate-700">Impuestos Adicionales Aplicables</h3>
            <div className="flex items-center space-x-6">
                <div className="flex items-center">
                    <input id="hasIvaRetention" type="checkbox" checked={orderData.hasIvaRetention} onChange={(e) => setOrderData({ hasIvaRetention: e.target.checked })} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"/>
                    <label htmlFor="hasIvaRetention" className="ml-2 text-sm font-medium text-slate-700">Retención de IVA</label>
                </div>
                <div className="flex items-center">
                    <input id="hasIslr" type="checkbox" checked={orderData.hasIslr} onChange={(e) => setOrderData({ hasIslr: e.target.checked })} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"/>
                    <label htmlFor="hasIslr" className="ml-2 text-sm font-medium text-slate-700">ISLR</label>
                </div>
                <div className="flex items-center">
                    <input id="hasItf" type="checkbox" checked={orderData.hasItf} onChange={(e) => setOrderData({ hasItf: e.target.checked })} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"/>
                    <label htmlFor="hasItf" className="ml-2 text-sm font-medium text-slate-700">ITF</label>
                </div>
            </div>
          </div>
      </div>
      
      <div className="mt-8 pt-6 border-t flex justify-between">
        <button type="button" onClick={onPrevStep} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Anterior</button>
        <button
          onClick={handleFinalSubmit}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar y Finalizar Orden'}
        </button>
      </div>
    </>
  );
}