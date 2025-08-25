import React from 'react';

interface Props {
  text: string;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'gray';
  className?: string;
}

export default function Badge({ text, color = 'gray', className }: Props) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-slate-100 text-slate-800',
  };

  const finalClassName = [
    'text-xs',
    'font-medium',
    'me-2',
    'px-2.5',
    'py-0.5',
    'rounded-full',
    colors[color],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={finalClassName}>{text}</span>;
}