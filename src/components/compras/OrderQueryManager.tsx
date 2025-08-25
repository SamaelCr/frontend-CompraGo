import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMasterDataStore } from '../../stores/masterDataStore';
import {
  getOrders,
  type ApiOrder,
  type OrderSearchParams,
  type Provider,
} from '../../utils/api';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import TableSkeleton from '../ui/TableSkeleton';
import Alert from '../ui/Alert';
import Paginator from '../ui/Paginator';
import { toast } from 'react-toastify';

const backendUrl = import.meta.env.PUBLIC_API_URL;
const ITEMS_PER_PAGE = 5;

export default function OrderQueryManager() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    keyword: '',
    provider: '',
    dateFrom: '',
    dateTo: '',
  });

  const providers = useMasterDataStore((state) => state.providers);
  const { fetchProviders } = useMasterDataStore.getState();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const fetchOrders = useCallback(
    async (page: number, currentFilters: typeof filters) => {
      setIsLoading(true);
      setError(null);
      try {
        const params: OrderSearchParams = {
          page,
          limit: ITEMS_PER_PAGE,
          ...currentFilters,
        };
        const response = await getOrders(params);
        setOrders(response.orders);
        setTotalPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar las órdenes.';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders(currentPage, filters);
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => {
      clearTimeout(handler);
    };
  }, [filters, currentPage, fetchOrders]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Al cambiar cualquier filtro, volvemos a la página 1
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      keyword: '',
      provider: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(clearedFilters);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const providerOptions = useMemo(
    () => providers.map((p: Provider) => ({ id: p.name, name: p.name })),
    [providers]
  );

  return (
    <>
      <Card title="Filtros de Búsqueda">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input
              label="Búsqueda General"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="N° Memo, proveedor, concepto..."
            />
            <Select
              label="Filtrar por Proveedor"
              name="provider"
              value={filters.provider}
              onChange={handleFilterChange}
              options={providerOptions}
            />
            <Input
              label="Fecha Desde"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              type="date"
            />
            <Input
              label="Fecha Hasta"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              type="date"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </Card>
      <div className="mt-8">
        {error && !isLoading && (
          <Alert variant="danger" title="Ocurrió un error">
            <p>{error}</p>
          </Alert>
        )}
        {isLoading ? (
          <TableSkeleton columns={8} />
        ) : (
          <Table
            headers={[
              'N° Memo',
              'Fecha',
              'Proveedor',
              'Concepto',
              'Tipo',
              'Monto Total',
              'IVA Usado',
              'Estado',
              'Acciones',
            ]}
          >
            {orders.map((row) => (
              <tr key={row.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-blue-600">
                  {row.memoNumber}
                </td>
                <td className="px-6 py-4">
                  {new Date(row.memoDate).toLocaleDateString('es-VE')}
                </td>
                <td className="px-6 py-4">{row.provider}</td>
                <td
                  className="px-6 py-4 text-slate-800 max-w-xs truncate"
                  title={row.concept}
                >
                  {row.concept}
                </td>
                <td className="px-6 py-4">{row.priceInquiryType}</td>
                <td className="px-6 py-4 text-right font-mono">
                  {row.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">{row.ivaPercentage}%</td>
                <td className="px-6 py-4">
                  {row.status === 'En Proceso' && (
                    <Badge color="blue" text="En Proceso" />
                  )}
                  {row.status === 'Aprobada' && (
                    <Badge color="green" text="Aprobada" />
                  )}
                  {row.status === 'Completada' && (
                    <Badge color="gray" text="Completada" />
                  )}
                  {row.status === 'Anulada' && (
                    <Badge color="red" text="Anulada" />
                  )}
                </td>
                <td className="px-6 py-4 flex items-center space-x-4">
                  <a
                    href={`/compras/${row.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Ver
                  </a>
                  <a
                    href={`${backendUrl}/api/orders/${row.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Descargar PDF"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-slate-500 hover:text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </td>
              </tr>
            ))}
          </Table>
        )}
        <Paginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}