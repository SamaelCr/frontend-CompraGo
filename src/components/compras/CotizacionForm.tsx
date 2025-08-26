import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useMasterDataStore } from '../../stores/masterDataStore';
import { useOrderFormStore } from '../../stores/orderFormStore';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface Props {
  onNextStep: () => void;
  onPrevStep: () => void;
}

const cotizacionSchema = z.object({
  provider: z.string().min(1, 'Debe seleccionar un proveedor.'),
  documentType: z.string().min(1, 'Debe seleccionar un tipo de documento.'),
  budgetNumber: z.string().min(1, 'El número de presupuesto es requerido.'),
  budgetDate: z.string().min(1, 'La fecha es requerida.'),
  offerQuality: z.string().min(1, 'Debe seleccionar la calidad de la oferta.'),
  deliveryTime: z.string().min(1, 'Debe seleccionar el tiempo de entrega.'),
});

export default function CotizacionForm({ onNextStep, onPrevStep }: Props) {
  console.log('Rendering CotizacionForm...');
  const providers = useMasterDataStore((state) => state.providers);
  const loading = useMasterDataStore((state) => state.loading.providers);
  const error = useMasterDataStore((state) => state.error.providers);
  const { fetchProviders } = useMasterDataStore.getState();

  const { 
    provider, 
    documentType, 
    budgetNumber, 
    budgetDate, 
    offerQuality, 
    deliveryTime 
  } = useOrderFormStore((state) => state.data);
  const setData = useOrderFormStore((state) => state.setData);
  
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  useEffect(() => {
    console.log('[CotizacionForm useEffect] Fetching providers if needed.');
    if (providers.length === 0) fetchProviders();
  }, [fetchProviders, providers.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToValidate = { provider, documentType, budgetNumber, budgetDate, offerQuality, deliveryTime };
    console.log('[CotizacionForm] Submitting, validating data:', dataToValidate);
    const result = cotizacionSchema.safeParse(dataToValidate);
    if (!result.success) {
      console.error('[CotizacionForm] Validation failed:', result.error.issues);
      setErrors(result.error.issues);
      toast.error('Por favor, corrija los errores en el formulario.');
      return;
    }
    console.log('[CotizacionForm] Validation successful.');
    setErrors([]);
    onNextStep();
  };

  const getError = (path: string) => errors.find((e) => e.path[0] === path)?.message;

  if (loading && providers.length === 0) return <p>Cargando proveedores...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Select
          label="Proveedor"
          required
          value={provider}
          onChange={(e) => setData({ provider: e.target.value })}
          options={providers}
          valueKey="name"
          error={getError('provider')}
        />
        <Select
          label="Tipo de Documento"
          required
          value={documentType}
          onChange={(e) => setData({ documentType: e.target.value })}
          options={['Presupuesto', 'Factura Proforma']}
          error={getError('documentType')}
        />
        <Input
          label="Nro. del Presupuesto"
          placeholder="PRE-12345"
          required
          value={budgetNumber}
          onChange={(e) => setData({ budgetNumber: e.target.value })}
          error={getError('budgetNumber')}
        />
        <Input
          label="Fecha del Presupuesto"
          type="date"
          required
          value={budgetDate}
          onChange={(e) => setData({ budgetDate: e.target.value })}
          error={getError('budgetDate')}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Select
          label="Calidad de la Oferta"
          required
          value={offerQuality}
          onChange={(e) => setData({ offerQuality: e.target.value })}
          options={['Alta', 'Media', 'Baja']}
          helperText="Indicador de prioridad."
          error={getError('offerQuality')}
        />
        <Select
          label="Tiempo de Entrega"
          required
          value={deliveryTime}
          onChange={(e) => setData({ deliveryTime: e.target.value })}
          options={['5 días', '15 días', '30 días', 'Inmediato']}
          error={getError('deliveryTime')}
        />
      </div>
      <div className="mt-6 flex justify-between">
        <button type="button" onClick={onPrevStep} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">
          Anterior
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Guardar y Continuar
        </button>
      </div>
    </form>
  );
}