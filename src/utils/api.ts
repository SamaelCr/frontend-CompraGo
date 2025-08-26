import { z } from 'zod';

const API_BASE_URL =
  import.meta.env.INTERNAL_API_URL || import.meta.env.PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    'Variable de entorno para la API no definida. Asegúrate de que PUBLIC_API_URL esté en tu .env'
  );
}

console.log(`[api.ts] Usando API_BASE_URL: ${API_BASE_URL}`);

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[apiFetch] Haciendo fetch a: ${url}`);
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.error?.message || JSON.stringify(errorData);
    } catch (e) {
      // No hacer nada
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (schema) {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Error de validación de Zod:', error.issues);
        throw new Error(
          `Los datos recibidos de la API no tienen el formato esperado: ${JSON.stringify(
            error.issues
          )}`
        );
      }
      throw error;
    }
  }

  return data as T;
}

// =================================================================
// DEFINICIONES DE SCHEMAS Y TIPOS
// =================================================================

const providerSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  rif: z.string(),
  address: z.string(),
});
export type Provider = z.infer<typeof providerSchema>;

const unitSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});
export type Unit = z.infer<typeof unitSchema>;

const positionSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});
export type Position = z.infer<typeof positionSchema>;

const officialSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  fullName: z.string(),
  isActive: z.boolean(),
  unitId: z.number(),
  unit: unitSchema.omit({ createdAt: true, updatedAt: true }),
  positionId: z.number(),
  position: positionSchema.omit({ createdAt: true, updatedAt: true }),
});
export type Official = z.infer<typeof officialSchema>;

const accountPointSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  accountNumber: z.string(),
  date: z.string(),
  subject: z.string(),
  synthesis: z.string(),
  programmaticCategory: z.string(),
  uel: z.string(),
  status: z.string(),
});
export type AccountPoint = z.infer<typeof accountPointSchema>;

const productSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  unit: z.string(),
  isActive: z.boolean(),
  appliesIva: z.boolean(),
});
export type Product = z.infer<typeof productSchema>;

const orderItemSchema = z.object({
  id: z.number().optional(),
  orderId: z.number().optional(),
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
  appliesIva: z.boolean(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

const orderSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  memoDate: z.string(),
  memoNumber: z.string(),
  requestingUnit: z.string(),
  responsibleOfficial: z.string(),
  concept: z.string(),
  provider: z.string(),
  documentType: z.string(),
  budgetNumber: z.string(),
  budgetDate: z.string(),
  deliveryTime: z.string(),
  offerQuality: z.string(),
  priceInquiryType: z.string(),
  observations: z.string(),
  hasIvaRetention: z.boolean(),
  hasIslr: z.boolean(),
  hasItf: z.boolean(),
  signedById: z.number(),
  signedBy: officialSchema.omit({ createdAt: true, updatedAt: true }),
  accountPointId: z.number(),
  accountPoint: accountPointSchema.omit({ createdAt: true, updatedAt: true }),
  items: z.array(orderItemSchema).nullable(),
  baseAmount: z.number(),
  ivaAmount: z.number(),
  ivaPercentage: z.number(),
  totalAmount: z.number(),
  status: z.string(),
});
export type ApiOrder = z.infer<typeof orderSchema>;
const ordersSchema = z.array(orderSchema);

const paginatedOrdersResponseSchema = z.object({
  orders: z.array(orderSchema),
  total: z.number(),
});
export type PaginatedOrdersResponse = z.infer<
  typeof paginatedOrdersResponseSchema
>;

const createOrderItemSchema = orderItemSchema.omit({
  id: true,
  orderId: true,
  total: true,
});
export type CreateOrderItemPayload = z.infer<typeof createOrderItemSchema>;

const createOrderPayloadSchema = orderSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    memoNumber: true,
    baseAmount: true,
    ivaAmount: true,
    totalAmount: true,
    status: true,
    accountPoint: true,
    signedBy: true,
    ivaPercentage: true,
  })
  .extend({
    items: z.array(createOrderItemSchema),
  });
export type CreateOrderPayload = z.infer<typeof createOrderPayloadSchema>;

const updateOrderPayloadSchema = createOrderPayloadSchema.extend({
  ivaPercentage: z.number(),
  status: z.string(), // CAMBIO: Añadido status al payload de actualización
});
export type UpdateOrderPayload = z.infer<typeof updateOrderPayloadSchema>;

// =================================================================
// FUNCIONES DE API
// =================================================================
const MASTER_DATA_ENDPOINT = `/api/master-data`;

export type OrderSearchParams = {
  page: number;
  limit: number;
  keyword?: string;
  provider?: string;
  dateFrom?: string;
  dateTo?: string;
};

// --- Órdenes ---
export function getOrders(
  params: OrderSearchParams
): Promise<PaginatedOrdersResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.provider) query.set('provider', params.provider);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);

  return apiFetch(
    `/api/orders?${query.toString()}`,
    {},
    paginatedOrdersResponseSchema
  );
}

export function getOrderById(id: number | string): Promise<ApiOrder> {
  return apiFetch(`/api/orders/${id}`, {}, orderSchema);
}

export function getOrdersByAccountPoint(apId: number): Promise<ApiOrder[]> {
  return apiFetch(`/api/orders/by-account-point/${apId}`, {}, ordersSchema);
}

export function createOrder(order: CreateOrderPayload): Promise<ApiOrder> {
  return apiFetch(
    '/api/orders',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    },
    orderSchema
  );
}

export function updateOrder(
  id: number,
  order: UpdateOrderPayload
): Promise<ApiOrder> {
  return apiFetch(
    `/api/orders/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    },
    orderSchema
  );
}

// --- Configuración ---
const ivaSchema = z.object({ ivaPercentage: z.number() });
export function getIvaPercentage(): Promise<{ ivaPercentage: number }> {
  return apiFetch(`/api/settings/iva`, {}, ivaSchema);
}
export function updateIvaPercentage(
  percentage: number
): Promise<{ message: string }> {
  return apiFetch(`/api/settings/iva`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ percentage }),
  });
}

// --- Productos / Catálogo ---
export function getProducts(): Promise<Product[]> {
  return apiFetch(`/api/products`, {}, z.array(productSchema));
}
export function createProduct(data: {
  name: string;
  unit: string;
  isActive: boolean;
  appliesIva: boolean;
}): Promise<Product> {
  return apiFetch(
    `/api/products`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    productSchema
  );
}
export function updateProduct(
  id: number,
  data: { name: string; unit: string; isActive: boolean; appliesIva: boolean }
): Promise<Product> {
  return apiFetch(
    `/api/products/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    productSchema
  );
}
export function deleteProduct(id: number): Promise<void> {
  return apiFetch(`/api/products/${id}`, { method: 'DELETE' });
}

// --- Proveedores ---
export function getProviders(): Promise<Provider[]> {
  return apiFetch(`/api/providers`, {}, z.array(providerSchema));
}
export function createProvider(
  provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Provider> {
  return apiFetch(
    `/api/providers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    },
    providerSchema
  );
}
export function updateProvider(
  id: number,
  provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Provider> {
  return apiFetch(
    `/api/providers/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    },
    providerSchema
  );
}
export function deleteProvider(id: number): Promise<void> {
  return apiFetch(`/api/providers/${id}`, { method: 'DELETE' });
}
// --- Unidades ---
export function getUnits(): Promise<Unit[]> {
  return apiFetch(`${MASTER_DATA_ENDPOINT}/units`, {}, z.array(unitSchema));
}
export function createUnit(data: {
  name: string;
  isActive: boolean;
}): Promise<Unit> {
  return apiFetch(
    `${MASTER_DATA_ENDPOINT}/units`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    unitSchema
  );
}
export function updateUnit(
  id: number,
  data: { name: string; isActive: boolean }
): Promise<Unit> {
  return apiFetch(
    `${MASTER_DATA_ENDPOINT}/units/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    unitSchema
  );
}
export function deleteUnit(id: number): Promise<void> {
  return apiFetch(`${MASTER_DATA_ENDPOINT}/units/${id}`, { method: 'DELETE' });
}
// --- Cargos ---
export function getPositions(): Promise<Position[]> {
  return apiFetch(`${MASTER_DATA_ENDPOINT}/positions`, {}, z.array(positionSchema));
}
export function createPosition(data: {
  name: string;
  isActive: boolean;
}): Promise<Position> {
  return apiFetch(
    `${MASTER_DATA_ENDPOINT}/positions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    positionSchema
  );
}
export function updatePosition(
  id: number,
  data: { name: string; isActive: boolean }
): Promise<Position> {
  return apiFetch(
    `${MASTER_DATA_ENDPOINT}/positions/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    positionSchema
  );
}
export function deletePosition(id: number): Promise<void> {
  return apiFetch(`${MASTER_DATA_ENDPOINT}/positions/${id}`, {
    method: 'DELETE',
  });
}
// --- Funcionarios ---
export function getOfficials(): Promise<Official[]> {
  return apiFetch(
    `${MASTER_DATA_ENDPOINT}/officials`,
    {},
    z.array(officialSchema)
  );
}
export function createOfficial(data: {
  fullName: string;
  unitId: number;
  positionId: number;
  isActive: boolean;
}): Promise<Official> {
  return apiFetch(
    `${MASTER_DATA_ENDPOINT}/officials`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    officialSchema
  );
}
export function updateOfficial(
  id: number,
  data: { fullName: string; unitId: number; positionId: number; isActive: boolean }
): Promise<Official> {
  return apiFetch(
    `${MASTER_DATA_ENDPOINT}/officials/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    officialSchema
  );
}
export function deleteOfficial(id: number): Promise<void> {
  return apiFetch(`${MASTER_DATA_ENDPOINT}/officials/${id}`, {
    method: 'DELETE',
  });
}
// --- Puntos de Cuenta ---
export function getAccountPoints(): Promise<AccountPoint[]> {
  return apiFetch('/api/account-points', {}, z.array(accountPointSchema));
}
export function createAccountPoint(
  data: Omit<
    AccountPoint,
    'id' | 'createdAt' | 'updatedAt' | 'accountNumber' | 'status'
  >
): Promise<AccountPoint> {
  return apiFetch(
    '/api/account-points',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    accountPointSchema
  );
}
export function updateAccountPoint(
  id: number,
  data: Omit<
    AccountPoint,
    'id' | 'createdAt' | 'updatedAt' | 'accountNumber' | 'status'
  >
): Promise<AccountPoint> {
  return apiFetch(
    `/api/account-points/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    accountPointSchema
  );
}
export function deleteAccountPoint(id: number): Promise<void> {
  return apiFetch(`/api/account-points/${id}`, { method: 'DELETE' });
}