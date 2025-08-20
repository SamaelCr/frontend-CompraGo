// src/components/compras/RequisitionForm.tsx
import React, { useState, useMemo } from 'react';
import type { Unit, Official } from '../../utils/api';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select'; 

interface Props {
  units: Unit[];
  officials: Official[];
}

export default function RequisitionForm({ units, officials }: Props) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  // --- INICIO DEL CAMBIO ---
  // El estado para el ID del funcionario seleccionado.
  // Esto es importante para que el segundo select también sea un componente controlado.
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>('');

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnitId(e.target.value);
    // Cuando la unidad cambia, reseteamos la selección del funcionario.
    setSelectedOfficialId(''); 
  };
  
  const handleOfficialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOfficialId(e.target.value);
  };
  // --- FIN DEL CAMBIO ---

  const filteredOfficials = useMemo(() => {
    if (!selectedUnitId) return [];
    return officials.filter(official => official.unit.id === parseInt(selectedUnitId, 10) && official.isActive);
  }, [selectedUnitId, officials]);

  console.log({
    selectedUnitId,
    filteredOfficialsCount: filteredOfficials.length,
    isFuncionarioDisabled: !selectedUnitId || filteredOfficials.length === 0,
  });


  const activeUnits = units.filter(unit => unit.isActive);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Fecha del Memorando" name="memoDate" type="date" value={new Date().toISOString().split('T')[0]} required={true} />
        <Input label="Número del Memorando" name="memoNumber" placeholder="Se generará automáticamente" disabled />
        
        <Select 
            label="Unidad Solicitante"
            name="unitId"
            options={activeUnits}
            value={selectedUnitId} 
            onChange={handleUnitChange}
            required
        />

        <Select 
          label="Funcionario Responsable" 
          name="responsibleOfficialId" 
          options={filteredOfficials}
          labelKey="fullName"
          // Vinculamos también este select a su propio estado
          value={selectedOfficialId}
          onChange={handleOfficialChange}
          required
          //disabled={!selectedUnitId || filteredOfficials.length === 0}
        />
      </div>
      <div className="mt-6">
        <Textarea label="Concepto o Descripción Detallada" name="concept" placeholder="Describa la necesidad. Esta información se usará en los siguientes pasos." rows={4} required={true} />
      </div>
    </>
  );
}