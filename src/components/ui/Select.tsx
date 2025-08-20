// src/components/ui/Select.tsx
import React from 'react';

interface Item {
  [key: string]: any;
}

interface Props {
  label: string;
  name?: string;
  options: (string | Item)[];
  valueKey?: string;
  labelKey?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string | number; // El valor controlado
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Select({
  label,
  name,
  options,
  valueKey = 'id',
  labelKey = 'name',
  helperText,
  required = false,
  disabled = false,
  value, // Recibimos el valor
  onChange,
}: Props) {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');
  const finalName = name || id;

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-700">{label}</label>
      <select
        id={id}
        name={finalName}
        className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:cursor-not-allowed disabled:bg-slate-200"
        required={required}
        disabled={disabled}
        // --- CORRECCIÓN CLAVE ---
        // Aseguramos que el valor nunca sea undefined para un componente controlado.
        // Si `value` es undefined o null, usamos una cadena vacía.
        value={value ?? ''} 
        onChange={onChange}
      >
        <option value="">Seleccione una opción</option>
        {options.map((option, index) => {
          if (typeof option === 'string') {
            // Usamos el índice como key para strings simples para evitar advertencias
            return <option key={index} value={option}>{option}</option>;
          }
          // Aseguramos que la key sea única y estable
          const keyValue = option[valueKey] ?? index;
          return <option key={keyValue} value={option[valueKey]}>{option[labelKey]}</option>;
        })}
      </select>
      {helperText && <p className="mt-2 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}