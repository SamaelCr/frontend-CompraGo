// src/components/ui/Textarea.tsx
import React from 'react';

interface Props {
  label: string;
  name?: string;
  rows?: number;
  placeholder?: string;
  value?: string;
  helperText?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function Textarea({
  label,
  name,
  rows = 3,
  placeholder,
  value,
  helperText,
  required = false,
  onChange,
}: Props) {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');
  const finalName = name || id;

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-700">{label}</label>
      <textarea
        id={id}
        name={finalName}
        rows={rows}
        className="block p-2.5 w-full text-sm text-slate-900 bg-slate-50 rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        defaultValue={value}
        required={required}
        onChange={onChange}
      />
      {helperText && <p className="mt-2 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}