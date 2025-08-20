// src/components/ui/Input.tsx
import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, Props>(({
  label,
  name,
  type = "text",
  helperText,
  error,
  ...props
}, ref) => {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');

  const baseClasses = "bg-slate-50 border text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-slate-200 disabled:cursor-not-allowed";
  const errorClasses = "border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-slate-300";

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        id={id}
        name={name}
        className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
        ref={ref}
        {...props}
      />
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : helperText && (
        <p className="mt-2 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

export default Input;