import React from 'react';
import type { ApiOrder, AccountPoint } from '../../../utils/api';
import Badge from '../../ui/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accountPoint: AccountPoint | null;
  orders: ApiOrder[];
  isLoading: boolean;
  error: string | null;
}

export default function OrdersForAPModal({
  isOpen,
  onClose,
  accountPoint,
  orders,
  isLoading,
  error,
}: Props) {
  if (!isOpen || !accountPoint) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              Órdenes Asociadas al Punto de Cuenta
            </h2>
            <p className="text-blue-600 font-semibold">
              {accountPoint.accountNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <p>Cargando órdenes...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : orders.length === 0 ? (
            <p>Este punto de cuenta no tiene órdenes asociadas.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2">N° Memo</th>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Proveedor</th>
                  <th className="px-4 py-2 text-right">Monto Total</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{order.memoNumber}</td>
                    <td className="px-4 py-2">
                      {new Date(order.memoDate).toLocaleDateString('es-VE')}
                    </td>
                    <td className="px-4 py-2">{order.provider}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge text={order.status} color="blue" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <a
                        href={`/compras/${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}