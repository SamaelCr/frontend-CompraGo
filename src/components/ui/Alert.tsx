import React from 'react';

interface Props {
  variant?: 'danger' | 'warning';
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Alert({ variant = 'danger', title, children, className }: Props) {
  const variants = {
    danger: {
      container: "bg-red-50 border-red-500 text-red-800",
      icon: "text-red-400",
      title: "text-red-900",
      text: "text-red-700",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-500 text-yellow-800",
      icon: "text-yellow-400",
      title: "text-yellow-900",
      text: "text-yellow-700",
    }
  };
  const selectedVariant = variants[variant];

  return (
    <div className={`rounded-md p-4 border-l-4 ${selectedVariant.container} ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${selectedVariant.icon}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-bold ${selectedVariant.title}`}>{title}</h3>
          <div className={`mt-2 text-sm ${selectedVariant.text}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}