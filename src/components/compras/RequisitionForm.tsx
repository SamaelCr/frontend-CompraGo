import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { toast } from 'react-toastify';
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
  requestingUnit: z.string().min(1, 'Debe seleccionar una unidad.'),
  responsibleOfficial: z.string().min(1, 'Debe seleccionar un funcionario.'),
  concept: z.string().min(10, 'El concepto debe tener al menos 10 caracteres.'),
});

export default function RequisitionForm({ onNextStep }: Props) {
  const units = useMasterDataStore((state) => state.units);
  const officials = useMasterDataStore((state) => state.officials);
  const loading = useMasterDataStore((state) => state.loading.units || state.loading.officials);
  const error = useMasterDataStore((state) => state.error.units || state.error.officials);
  const { fetchUnits, fetchOfficials } = useMasterDataStore.getState();

  const { data: orderData, setData } = useOrderFormStore();
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  useEffect(() => {
    if (units.length === 0) fetchUnits();
    if (officials.length === 0) fetchOfficials();
  }, [fetchUnits, fetchOfficials, units.length, officials.length]);

  const activeUnits = useMemo(() => units.filter((u) => u.isActive), [units]);
  
  const filteredOfficials = useMemo(() => {
    if (!orderData.requestingUnit) return [];
    return officials.filter(
      (o) => o.unit.name === orderData.requestingUnit && o.isActive
    );
  }, [orderData.requestingUnit, officials]);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnitId = e.target.value;
    const selectedUnit = activeUnits.find(unit => unit.id.toString() === selectedUnitId);
    setData({
      requestingUnit: selectedUnit ? selectedUnit.name : '',
      responsibleOfficial: '',
    });
  };
  
  const selectedUnitId = useMemo(() => {
    return activeUnits.find(unit => unit.name === orderData.requestingUnit)?.id.toString() || '';
  }, [orderData.requestingUnit, activeUnits]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = requisitionSchema.safeParse(orderData);
    if (!result.success) {
      setErrors(result.error.issues);
      toast.error('Por favor, corrija los errores en el formulario.');
      return;
    }
    setErrors([]);
    onNextStep();
  };

  const getError = (path: string) => errors.find((e) => e.path[0] === path)?.message;

  // CAMBIO: Lógica mejorada para el mensaje de ayuda
  const isOfficialDisabled = !orderData.requestingUnit || filteredOfficials.length === 0;
  let officialHelperText: string | undefined;
  if (!orderData.requestingUnit) {
    officialHelperText = 'Seleccione una unidad primero.';
  } else if (filteredOfficials.length === 0) {
    officialHelperText = 'La unidad seleccionada no tiene funcionarios activos asignados.';
  }

  if (loading && units.length === 0) return <p>Cargando datos...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Fecha del Memorando"
          type="date"
          required
          value={orderData.memoDate}
          onChange={(e) => setData({ memoDate: e.target.value })}
          error={getError('memoDate')}
        />
        <Input label="Número del Memorando" placeholder="Se generará automáticamente" disabled />
        <Select
          label="Unidad Solicitante"
          required
          value={selectedUnitId}
          onChange={handleUnitChange}
          options={activeUnits}
          error={getError('requestingUnit')}
        />
        <Select
          label="Funcionario Responsable"
          required
          value={orderData.responsibleOfficial}
          onChange={(e) => setData({ responsibleOfficial: e.target.value })}
          options={filteredOfficials}
          labelKey="fullName"
          valueKey="fullName"
          disabled={isOfficialDisabled}
          helperText={officialHelperText} // CAMBIO: Usamos la nueva variable para el texto de ayuda
          error={getError('responsibleOfficial')}
        />
      </div>
      <div className="mt-6">
        <Textarea
          label="Concepto o Descripción Detallada"
          placeholder="Describa la necesidad..."
          rows={4}
          required
          value={orderData.concept}
          onChange={(e) => setData({ concept: e.target.value })}
          error={getError('concept')}
        />
      </div>
      <div className="mt-6 text-right">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Guardar y Continuar
        </button>
      </div>
    </form>
  );
}