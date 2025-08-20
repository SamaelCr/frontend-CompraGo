import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterDataStore } from '../../stores/masterDataStore';
import Input from '../ui/Input';
import Select from '../ui/Select';

// 1. Esquema de validación AJUSTADO
const cotizacionSchema = z.object({
  providerId: z.string().min(1, 'Debe seleccionar un proveedor.'),
  documentType: z.string().min(1, 'Debe seleccionar un tipo de documento.'),
  budgetNumber: z.string().min(1, 'El número de presupuesto es requerido.'),
  budgetDate: z.string().min(1, 'La fecha es requerida.'),
  // Usamos z.coerce.number() que es más directo para la conversión de tipos
  baseAmount: z.coerce
    .number({ invalid_type_error: 'Debe ingresar un número.' })
    .positive('El monto base debe ser mayor a cero.'),
  offerQuality: z.string().min(1, 'Debe seleccionar la calidad de la oferta.'),
  deliveryTime: z.string().min(1, 'Debe seleccionar el tiempo de entrega.'),
});

// El tipo se infiere correctamente
type CotizacionFormData = z.infer<typeof cotizacionSchema>;

export default function CotizacionForm() {
  const { providers, fetchProviders, loading, error } = useMasterDataStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // 2. Aquí está la clave: pasamos el tipo explícitamente a useForm
  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<CotizacionFormData>({ // <--- TIPADO EXPLÍCITO
    resolver: zodResolver(cotizacionSchema),
    defaultValues: {
      providerId: '',
      documentType: '',
      budgetNumber: '',
      budgetDate: new Date().toISOString().split('T')[0],
      baseAmount: undefined, // Usamos undefined para que el placeholder del input aparezca
      offerQuality: '',
      deliveryTime: '',
    },
    mode: 'onTouched'
  });

  // La función onSubmit ahora tiene el tipo correcto sin ambigüedad
  const onSubmit = (data: CotizacionFormData) => {
    console.log("Datos de cotización:", data);
    alert("Formulario de cotización listo. Revise la consola.");
  };

  if (loading.providers) return <p>Cargando proveedores...</p>;
  if (error.providers) return <p className="text-red-500">Error: {error.providers}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Controller
          name="providerId"
          control={control}
          render={({ field }) => (
            <Select 
              label="Proveedor" 
              options={providers} 
              required={true} 
              {...field}
              error={errors.providerId?.message}
            />
          )}
        />
        <Controller
          name="documentType"
          control={control}
          render={({ field }) => (
            <Select 
              label="Tipo de Documento" 
              options={["Presupuesto", "Factura Proforma"]} 
              required={true} 
              {...field}
              error={errors.documentType?.message}
            />
          )}
        />
        <Input 
          label="Nro. del Presupuesto" 
          placeholder="PRE-12345" 
          required={true}
          {...register('budgetNumber')}
          error={errors.budgetNumber?.message}
        />
        <Input 
          label="Fecha del Presupuesto" 
          type="date" 
          required={true}
          {...register('budgetDate')}
          error={errors.budgetDate?.message}
        />
        <Input 
          label="Monto Base" 
          type="number" 
          placeholder="1500.00" 
          required={true}
          step="0.01"
          {...register('baseAmount')}
          error={errors.baseAmount?.message}
        />
        <Input 
          label="Monto IVA (16%)" 
          type="number" 
          placeholder="240.00" 
          helperText="El sistema lo calculará automáticamente." 
          disabled 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Controller
          name="offerQuality"
          control={control}
          render={({ field }) => (
            <Select 
              label="Calidad de la Oferta" 
              options={["Alta", "Media", "Baja"]} 
              helperText="Indicador de prioridad." 
              required={true} 
              {...field}
              error={errors.offerQuality?.message}
            />
          )}
        />
        <Controller
          name="deliveryTime"
          control={control}
          render={({ field }) => (
            <Select 
              label="Tiempo de Entrega" 
              options={["5 días", "15 días", "30 días", "Inmediato"]} 
              required={true} 
              {...field}
              error={errors.deliveryTime?.message}
            />
          )}
        />
      </div>
    </form>
  );
}