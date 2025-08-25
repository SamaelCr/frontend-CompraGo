import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode; // Aceptamos los children de React
}

export default function Card({ title, subtitle, className, children }: Props) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className || ''}`}>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      <div className="mt-6">
        {children} {/* Renderizamos los children aquí */}
      </div>
    </div>
  );
}