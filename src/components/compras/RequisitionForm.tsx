// src/components/compras/RequisitionForm.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterDataStore } from '../../stores/masterDataStore';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select'; 

// (El schema y el tipo se mantienen igual que en la respuesta anterior)
const requisitionSchema = z.object({
  memoDate: z.string().min(1, 'La fecha es requerida.'),
  unitId: z.string().min(1, 'Debe seleccionar una unidad.'),
  responsibleOfficialId: z.string().min(1, 'Debe seleccionar un funcionario.'),
  concept: z
    .string()
    .min(10, 'El concepto debe tener al menos 10 caracteres.')
    .max(500, 'El concepto no debe exceder los 500 caracteres.'),
});

type RequisitionFormData = z.infer<typeof requisitionSchema>;

export default function RequisitionForm() {
  // Obtenemos los datos y acciones del store
  const { units, officials, fetchUnits, fetchOfficials, loading, error } = useMasterDataStore(state => ({
    units: state.units,
    officials: state.officials,
    fetchUnits: state.fetchUnits,
    fetchOfficials: state.fetchOfficials,
    loading: state.loading.units || state.loading.officials,
    error: state.error.units || state.error.officials,
  }));
  
  // Cargamos los datos cuando el componente se monta
  useEffect(() => {
    fetchUnits();
    fetchOfficials();
  }, [fetchUnits, fetchOfficials]);
  
  // El resto del componente es igual que en la respuesta anterior (la que usa react-hook-form)
  const {
    control,
    handleSubmit,
    watch,
    resetField,
    register,
    formState: { errors },
  } = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: {
      memoDate: new Date().toISOString().split('T')[0],
      unitId: '',
      responsibleOfficialId: '',
      concept: '',
    },
    mode: 'onTouched',
  });

  const selectedUnitId = watch('unitId');

  const filteredOfficials = useMemo(() => {
    if (!selectedUnitId) return [];
    resetField('responsibleOfficialId', { defaultValue: '' });
    return officials.filter(
      (official) =>
        official.unit.id === parseInt(selectedUnitId, 10) && official.isActive
    );
  }, [selectedUnitId, officials, resetField]);

  const activeUnits = units.filter((unit) => unit.isActive);
  
  const onSubmit = (data: RequisitionFormData) => {
    console.log('Formulario válido, datos a enviar:', data);
    alert('Formulario listo para enviar. Revisa la consola para ver los datos.');
  };

  // UI para mostrar estados de carga/error
  if (loading) return <p>Cargando datos necesarios para el formulario...</p>;
  if (error) return <p className="text-red-500">Error al cargar datos: {error}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Fecha del Memorando"
          type="date"
          required={true}
          {...register('memoDate')}
          error={errors.memoDate?.message}
        />
        <Input
          label="Número del Memorando"
          placeholder="Se generará automáticamente"
          disabled
        />
        <Controller
          name="unitId"
          control={control}
          render={({ field }) => (
            <Select
              label="Unidad Solicitante"
              options={activeUnits}
              required
              {...field}
              error={errors.unitId?.message}
            />
          )}
        />
        <Controller
          name="responsibleOfficialId"
          control={control}
          render={({ field }) => (
            <Select
              label="Funcionario Responsable"
              options={filteredOfficials}
              labelKey="fullName"
              required
              disabled={!selectedUnitId || filteredOfficials.length === 0}
              {...field}
              error={errors.responsibleOfficialId?.message}
            />
          )}
        />
      </div>
      <div className="mt-6">
        <Textarea
          label="Concepto o Descripción Detallada"
          placeholder="Describa la necesidad. Esta información se usará en los siguientes pasos."
          rows={4}
          required={true}
          {...register('concept')}
          error={errors.concept?.message}
        />
      </div>
    </form>
  );
}