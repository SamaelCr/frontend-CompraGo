import React from 'react';

interface Item {
  [key: string]: any;
}

// Añadimos 'title' a las props para que pueda ser recibido
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | Item)[];
  valueKey?: string;
  labelKey?: string;
  helperText?: string;
  error?: string;
  title?: string; 
}

const Select = React.forwardRef<HTMLSelectElement, Props>(({
  label,
  name,
  options,
  valueKey = 'id',
  labelKey = 'name',
  helperText,
  error,
  title, // Capturamos el title aquí
  ...props
}, ref) => {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');

  const baseClasses = "bg-slate-50 border text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-slate-200 disabled:cursor-not-allowed";
  const errorClasses = "border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-slate-300";

  // El div exterior ahora controla el tooltip
  return (
    <div title={props.disabled ? title : undefined}>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
      <select
        id={id}
        name={name}
        className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        ref={ref}
        {...props} // Pasamos el resto de props, que incluye 'disabled'
      >
        <option value="">Seleccione una opción</option>
        {options.map((option, index) => {
          if (typeof option === 'string') {
            return <option key={index} value={option}>{option}</option>;
          }
          const keyValue = option[valueKey] ?? index;
          return <option key={keyValue} value={option[valueKey]}>{option[labelKey]}</option>;
        })}
      </select>
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : helperText && (
        <p className="mt-2 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

export default Select;