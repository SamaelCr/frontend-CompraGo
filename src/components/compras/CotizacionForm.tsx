import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterDataStore } from '../../stores/masterDataStore';
import { useOrderFormStore } from '../../stores/orderFormStore';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface Props {
  onNextStep: () => void;
  onPrevStep: () => void;
}

const cotizacionSchema = z.object({
  providerId: z.string().min(1, 'Debe seleccionar un proveedor.'),
  documentType: z.string().min(1, 'Debe seleccionar un tipo de documento.'),
  budgetNumber: z.string().min(1, 'El número de presupuesto es requerido.'),
  budgetDate: z.string().min(1, 'La fecha es requerida.'),
  baseAmount: z.coerce.number({ invalid_type_error: 'Debe ingresar un número.' }).positive('El monto base debe ser mayor a cero.'),
  offerQuality: z.string().min(1, 'Debe seleccionar la calidad de la oferta.'),
  deliveryTime: z.string().min(1, 'Debe seleccionar el tiempo de entrega.'),
});

type CotizacionFormData = z.infer<typeof cotizacionSchema>;

export default function CotizacionForm({ onNextStep, onPrevStep }: Props) {
  // --- SOLUCIÓN: Aplicamos el mismo patrón aquí ---
  const providers = useMasterDataStore(state => state.providers);
  const loading = useMasterDataStore(state => state.loading.providers);
  const error = useMasterDataStore(state => state.error.providers);
  const { fetchProviders } = useMasterDataStore.getState();

  const { data: orderData, setData: setOrderData } = useOrderFormStore();

  useEffect(() => {
    if (providers.length === 0) {
      fetchProviders();
    }
  }, [fetchProviders, providers.length]);

  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<CotizacionFormData>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: {
      providerId: providers.find(p => p.name === orderData.provider)?.id.toString() || '',
      documentType: orderData.documentType || '',
      budgetNumber: orderData.budgetNumber || '',
      budgetDate: orderData.budgetDate,
      baseAmount: orderData.baseAmount || undefined,
      offerQuality: orderData.offerQuality || '',
      deliveryTime: orderData.deliveryTime || '',
    },
    mode: 'onTouched'
  });

  const onSubmit = (data: CotizacionFormData) => {
    const selectedProvider = providers.find(p => p.id === parseInt(data.providerId, 10));
    setOrderData({
        provider: selectedProvider?.name || '',
        documentType: data.documentType,
        budgetNumber: data.budgetNumber,
        budgetDate: data.budgetDate,
        baseAmount: data.baseAmount,
        offerQuality: data.offerQuality,
        deliveryTime: data.deliveryTime,
    });
    onNextStep();
  };

  if (loading && providers.length === 0) return <p>Cargando proveedores...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Controller name="providerId" control={control} render={({ field }) => (<Select label="Proveedor" options={providers} required={true} {...field} error={errors.providerId?.message} />)} />
        <Controller name="documentType" control={control} render={({ field }) => (<Select label="Tipo de Documento" options={["Presupuesto", "Factura Proforma"]} required={true} {...field} error={errors.documentType?.message} />)} />
        <Input label="Nro. del Presupuesto" placeholder="PRE-12345" required={true} {...register('budgetNumber')} error={errors.budgetNumber?.message} />
        <Input label="Fecha del Presupuesto" type="date" required={true} {...register('budgetDate')} error={errors.budgetDate?.message} />
        <Input label="Monto Base" type="number" placeholder="1500.00" required={true} step="0.01" {...register('baseAmount')} error={errors.baseAmount?.message} />
        <Input label="Monto IVA (16%)" type="number" placeholder="240.00" helperText="El sistema lo calculará automáticamente." disabled />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Controller name="offerQuality" control={control} render={({ field }) => (<Select label="Calidad de la Oferta" options={["Alta", "Media", "Baja"]} helperText="Indicador de prioridad." required={true} {...field} error={errors.offerQuality?.message} />)} />
        <Controller name="deliveryTime" control={control} render={({ field }) => (<Select label="Tiempo de Entrega" options={["5 días", "15 días", "30 días", "Inmediato"]} required={true} {...field} error={errors.deliveryTime?.message} />)} />
      </div>
      <div className="mt-6 flex justify-between">
          <button type="button" onClick={onPrevStep} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Anterior</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Guardar y Continuar</button>
      </div>
    </form>
  );
}