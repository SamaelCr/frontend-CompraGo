// src/components/ui/Textarea.tsx
import React from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(({
  label,
  name,
  rows = 3,
  helperText,
  error,
  ...props
}, ref) => {
  const id = name || label.toLowerCase().replace(/\s+/g, '-');
  
  const baseClasses = "block p-2.5 w-full text-sm text-slate-900 bg-slate-50 rounded-lg border focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = "border-red-500 text-red-900 placeholder-red-700 focus:ring-red-500 focus:border-red-500";
  const normalClasses = "border-slate-300";

  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-slate-700">{label}{props.required && <span className="text-red-500">*</span>}</label>
      <textarea
        id={id}
        name={name}
        rows={rows}
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

export default Textarea;