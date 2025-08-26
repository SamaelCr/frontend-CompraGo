import React from 'react';
import { useOrderFormStore } from '../../stores/orderFormStore';

export default function ResumeOrderWidget() {
  const data = useOrderFormStore((state) => state.data);

  // Determina si hay progreso en el formulario
  const hasProgress = data.concept || data.items.length > 0;
  const { type, orderId } = data.formContext;

  // No mostrar nada si no hay progreso o no se sabe qué formulario era
  if (!hasProgress || !type) {
    return null;
  }

  const href = type === 'edit' ? `/compras/editar/${orderId}` : '/compras/nueva';
  const text = type === 'edit' ? 'Volver a la edición' : 'Volver a la nueva orden';

  return (
    <a
      href={href}
      className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
    >
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <span className="font-semibold text-sm">{text}</span>
      </div>
    </a>
  );
}

// Añadimos una simple animación de entrada en el CSS global o aquí
const styles = `
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
`;

// Inyectamos los estilos en el head del documento
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}