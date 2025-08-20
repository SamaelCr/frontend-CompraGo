// src/components/ui/Input.tsx
import React from 'react';

interface Props {
  label: string;
  name?: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value?: string | number;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  helperText,
  disabled = false,
  required = false,
  onChange,
}: Props) {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');
  const finalName = name || id;

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        id={id}
        name={finalName}
        className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-slate-200 disabled:cursor-not-allowed"
        placeholder={placeholder}
        defaultValue={value} // Usamos defaultValue para componentes no controlados por estado de React
        disabled={disabled}
        required={required}
        onChange={onChange}
      />
      {helperText && <p className="mt-2 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}