import React, { useState } from 'react';
import { useOrderFormStore } from '../stores/orderFormStore';
import ConfirmModal from './ui/ConfirmModal';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/compras/nueva', label: 'Nueva Orden', id: 'new-order-link' },
  { href: '/compras/consultas', label: 'Consultas' },
  {
    label: 'Administración',
    subLinks: [
      { href: '/administracion/proveedores', label: 'Gestionar Proveedores' },
      { href: '/administracion/unidades', label: 'Gestionar Unidades' },
      { href: '/administracion/puntos-cuenta', label: 'Puntos de Cuenta' },
      { href: '/administracion/productos', label: 'Productos y Servicios' },
      { href: '/administracion/configuracion', label: 'Configuración' },
      { href: '/administracion/cierre-anual', label: 'Cierre Anual' },
    ],
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState('');

  const handleNewOrderClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const store = useOrderFormStore.getState();
    const hasProgress = store.data.concept || store.data.items.length > 0;

    if (hasProgress) {
      event.preventDefault();
      setNavigationTarget(event.currentTarget.href);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmReset = () => {
    useOrderFormStore.getState().reset();
    if (navigationTarget) {
      window.location.href = navigationTarget;
    }
    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-slate-900">
            <a href="/">Sistema de Compras</a>
          </div>

          <ul className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <li key={link.label} className="relative group">
                {link.href ? (
                  <a
                    href={link.href}
                    onClick={link.id ? handleNewOrderClick : undefined}
                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <>
                    <button className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center cursor-default">
                      {link.label}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {link.subLinks && (
                      <ul className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                        {link.subLinks.map((sub) => (
                          <li key={sub.href}>
                            <a href={sub.href} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-600">
                              {sub.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`hamburger focus:outline-none ${isMenuOpen ? 'open' : ''}`}>
              <span className="hamburger-top" />
              <span className="hamburger-middle" />
              <span className="hamburger-bottom" />
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="md:hidden">
            <ul className="flex flex-col items-center py-4 space-y-2 bg-white border-t border-slate-200">
              {navLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      onClick={link.id ? handleNewOrderClick : undefined}
                      className="text-slate-700 font-semibold hover:text-blue-600 px-4 py-2 block"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <div className="text-center">
                      <span className="text-slate-800 font-bold px-4 py-2 block">{link.label}</span>
                      <ul className="pl-4">
                        {link.subLinks?.map((sub) => (
                          <li key={sub.href}>
                            <a href={sub.href} className="text-slate-600 hover:text-blue-600 px-4 py-2 block text-sm">
                              - {sub.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Descartar Orden en Progreso"
        description="Tiene una orden sin guardar. Si continúa, se perderán los datos. ¿Está seguro de que desea empezar una nueva orden?"
        confirmText="Sí, descartar"
        intent="danger"
      />
    </>
  );
}

// Estilos para el menú hamburguesa que antes estaban en el archivo .astro
const hamburgerStyles = `
  .hamburger {
    cursor: pointer;
    width: 24px;
    height: 24px;
    transition: all 0.25s;
    position: relative;
  }
  .hamburger-top,
  .hamburger-middle,
  .hamburger-bottom {
    position: absolute;
    width: 24px;
    height: 2px;
    top: 0;
    left: 0;
    background: #334155;
    transform: rotate(0);
    transition: all 0.5s;
  }
  .hamburger-middle { transform: translateY(7px); }
  .hamburger-bottom { transform: translateY(14px); }
  .open { transform: rotate(90deg); }
  .open .hamburger-top { transform: rotate(45deg) translateY(6px) translateX(6px); }
  .open .hamburger-middle { display: none; }
  .open .hamburger-bottom { transform: rotate(-45deg) translateY(6px) translateX(-6px); }
`;

// Inyectar los estilos en el <head>
if (typeof window !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = hamburgerStyles;
  document.head.appendChild(styleTag);
}