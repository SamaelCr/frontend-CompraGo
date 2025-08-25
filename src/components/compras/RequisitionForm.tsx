import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterDataStore } from '../../stores/masterDataStore';
import { useOrderFormStore } from '../../stores/orderFormStore';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select'; 

interface Props {
  onNextStep: () => void;
}

const requisitionSchema = z.object({
  memoDate: z.string().min(1, 'La fecha es requerida.'),
  unitId: z.string().min(1, 'Debe seleccionar una unidad.'),
  responsibleOfficialId: z.string().min(1, 'Debe seleccionar un funcionario.'),
  concept: z.string().min(10, 'El concepto debe tener al menos 10 caracteres.').max(500, 'El concepto no debe exceder los 500 caracteres.'),
});

type RequisitionFormData = z.infer<typeof requisitionSchema>;

export default function RequisitionForm({ onNextStep }: Props) {
  const units = useMasterDataStore(state => state.units);
  const officials = useMasterDataStore(state => state.officials);
  const loading = useMasterDataStore(state => state.loading.units || state.loading.officials);
  const error = useMasterDataStore(state => state.error.units || state.error.officials);
  const { fetchUnits, fetchOfficials } = useMasterDataStore.getState();
  
  const { data: orderData, setData: setOrderData } = useOrderFormStore();

  useEffect(() => {
    if (units.length === 0) fetchUnits();
    if (officials.length === 0) fetchOfficials();
  }, [fetchUnits, fetchOfficials, units.length, officials.length]);
  
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
      memoDate: orderData.memoDate,
      unitId: units.find(u => u.name === orderData.requestingUnit)?.id.toString() || '',
      responsibleOfficialId: officials.find(o => o.fullName === orderData.responsibleOfficial)?.id.toString() || '',
      concept: orderData.concept,
    },
    mode: 'onTouched',
  });

  const selectedUnitId = watch('unitId');

  useEffect(() => {
    if (control._formState.dirtyFields.unitId) {
        resetField('responsibleOfficialId', { defaultValue: '' });
    }
  }, [selectedUnitId, resetField, control._formState.dirtyFields.unitId]);

  const filteredOfficials = useMemo(() => {
    if (!selectedUnitId) return [];
    return officials.filter(
      (official) => official.unit.id === parseInt(selectedUnitId, 10) && official.isActive
    );
  }, [selectedUnitId, officials]);

  const activeUnits = units.filter((unit) => unit.isActive);
  
  const onSubmit = (data: RequisitionFormData) => {
    const selectedUnit = activeUnits.find(u => u.id === parseInt(data.unitId, 10));
    const selectedOfficial = officials.find(o => o.id === parseInt(data.responsibleOfficialId, 10));

    setOrderData({
        memoDate: data.memoDate,
        requestingUnit: selectedUnit?.name || '',
        responsibleOfficial: selectedOfficial?.fullName || '',
        concept: data.concept,
    });
    onNextStep();
  };

  const isOfficialDisabled = !selectedUnitId || filteredOfficials.length === 0;
  let officialHelperText = '';
  if (isOfficialDisabled) {
    if (!selectedUnitId) {
      officialHelperText = 'Primero debe seleccionar una Unidad Solicitante.';
    } else {
      officialHelperText = 'La unidad seleccionada no tiene funcionarios activos registrados.';
    }
  }

  if (loading && units.length === 0) return <p>Cargando datos necesarios...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Fecha del Memorando" type="date" required={true} {...register('memoDate')} error={errors.memoDate?.message} />
        <Input label="Número del Memorando" placeholder="Se generará automáticamente" disabled />
        <Controller name="unitId" control={control} render={({ field }) => (<Select label="Unidad Solicitante" options={activeUnits} required {...field} error={errors.unitId?.message} />)} />
        
        {/* --- CAMBIO CLAVE: Usamos `helperText` en lugar de `title` --- */}
        <Controller name="responsibleOfficialId" control={control} render={({ field }) => (
          <Select 
            label="Funcionario Responsable" 
            options={filteredOfficials} 
            labelKey="fullName" 
            required 
            disabled={isOfficialDisabled}
            helperText={isOfficialDisabled ? officialHelperText : undefined} // <-- AQUÍ ESTÁ LA MAGIA
            {...field} 
            error={errors.responsibleOfficialId?.message}
          />
        )} />
      </div>
      <div className="mt-6">
        <Textarea label="Concepto o Descripción Detallada" placeholder="Describa la necesidad..." rows={4} required={true} {...register('concept')} error={errors.concept?.message} />
      </div>
      <div className="mt-6 text-right">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Guardar y Continuar</button>
      </div>
    </form>
  );
}