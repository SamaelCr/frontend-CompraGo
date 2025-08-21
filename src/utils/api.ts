// frontend-CompraGo/src/utils/api.ts

import { z } from 'zod';

// --- ESTA ES LA LÓGICA CRUCIAL QUE FALTABA EN TU ARCHIVO ---
// Determina la URL correcta. En el servidor (dentro de Docker) usará la URL interna.
// En el navegador, usará la URL pública.
const API_BASE_URL = import.meta.env.INTERNAL_API_URL || import.meta.env.PUBLIC_API_URL;

// Verificación para asegurar que al menos una de las URLs está definida.
if (!API_BASE_URL) {
  throw new Error("Variable de entorno para la API no definida. Asegúrate de que PUBLIC_API_URL esté en tu .env");
}

// Log para que veas en la terminal del frontend qué URL se está usando.
console.log(`[api.ts] Usando API_BASE_URL: ${API_BASE_URL}`);

// =================================================================
// FUNCIÓN AUXILIAR CENTRALIZADA
// =================================================================
async function apiFetch<T>(
  endpoint: string, // Ahora solo pasamos la ruta, ej: /api/orders
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  // Construimos la URL completa usando la base correcta.
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Log para depurar la URL exacta a la que se hace la petición.
  console.log(`[apiFetch] Haciendo fetch a: ${url}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.error?.message || JSON.stringify(errorData);
    } catch (e) {
      // No hacer nada si el cuerpo del error no es JSON
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
        console.error("Error de validación de Zod:", error.issues);
        throw new Error(`Los datos recibidos de la API no tienen el formato esperado: ${JSON.stringify(error.issues)}`);
      }
      throw error;
    }
  }

  return data as T;
}

// =================================================================
// DEFINICIONES DE SCHEMAS Y TIPOS
// =================================================================
const providerSchema = z.object({ id: z.number(), createdAt: z.string(), updatedAt: z.string(), name: z.string(), rif: z.string(), address: z.string() });
export type Provider = z.infer<typeof providerSchema>;
const providersSchema = z.array(providerSchema);

const unitSchema = z.object({ id: z.number(), createdAt: z.string(), updatedAt: z.string(), name: z.string(), isActive: z.boolean() });
export type Unit = z.infer<typeof unitSchema>;

const positionSchema = z.object({ id: z.number(), createdAt: z.string(), updatedAt: z.string(), name: z.string(), isActive: z.boolean() });
export type Position = z.infer<typeof positionSchema>;

const officialSchema = z.object({ id: z.number(), createdAt: z.string(), updatedAt: z.string(), fullName: z.string(), isActive: z.boolean(), unitId: z.number(), unit: unitSchema.omit({ createdAt: true, updatedAt: true }), positionId: z.number(), position: positionSchema.omit({ createdAt: true, updatedAt: true }) });
export type Official = z.infer<typeof officialSchema>;

const orderSchema = z.object({ id: z.number(), createdAt: z.string(), updatedAt: z.string(), memoDate: z.string(), memoNumber: z.string(), requestingUnit: z.string(), responsibleOfficial: z.string(), concept: z.string(), provider: z.string(), documentType: z.string(), budgetNumber: z.string(), budgetDate: z.string(), baseAmount: z.number(), ivaAmount: z.number(), totalAmount: z.number(), deliveryTime: z.string(), offerQuality: z.string(), accountPointDate: z.string(), priceInquiryType: z.string(), subject: z.string(), synthesis: z.string(), programmaticCategory: z.string(), uel: z.string(), status: z.string() });
const ordersSchema = z.array(orderSchema);
export type ApiOrder = z.infer<typeof orderSchema>;

// =================================================================
// FUNCIONES DE API (ahora usan solo el endpoint)
// =================================================================
const MASTER_DATA_ENDPOINT = `/api/master-data`;

// --- Órdenes ---
export function getOrders(): Promise<ApiOrder[]> { return apiFetch(`/api/orders`, {}, ordersSchema); }
export function getOrderById(id: number | string): Promise<ApiOrder> { return apiFetch(`/api/orders/${id}`, {}, orderSchema); }
// --- Proveedores ---
export function getProviders(): Promise<Provider[]> { return apiFetch(`/api/providers`, {}, providersSchema); }
export function createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> { return apiFetch(`/api/providers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(provider) }, providerSchema); }
export function updateProvider(id: number, provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> { return apiFetch(`/api/providers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(provider) }, providerSchema); }
export function deleteProvider(id: number): Promise<void> { return apiFetch(`/api/providers/${id}`, { method: 'DELETE' }); }
// --- Unidades ---
export function getUnits(): Promise<Unit[]> { return apiFetch(`${MASTER_DATA_ENDPOINT}/units`, {}, z.array(unitSchema)); }
export function createUnit(data: { name: string; isActive: boolean }): Promise<Unit> { return apiFetch(`${MASTER_DATA_ENDPOINT}/units`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }, unitSchema); }
export function updateUnit(id: number, data: { name: string; isActive: boolean }): Promise<Unit> { return apiFetch(`${MASTER_DATA_ENDPOINT}/units/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }, unitSchema); }
export function deleteUnit(id: number): Promise<void> { return apiFetch(`${MASTER_DATA_ENDPOINT}/units/${id}`, { method: 'DELETE' }); }
// --- Cargos ---
export function getPositions(): Promise<Position[]> { return apiFetch(`${MASTER_DATA_ENDPOINT}/positions`, {}, z.array(positionSchema)); }
export function createPosition(data: { name: string; isActive: boolean }): Promise<Position> { return apiFetch(`${MASTER_DATA_ENDPOINT}/positions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }, positionSchema); }
export function updatePosition(id: number, data: { name: string; isActive: boolean }): Promise<Position> { return apiFetch(`${MASTER_DATA_ENDPOINT}/positions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }, positionSchema); }
export function deletePosition(id: number): Promise<void> { return apiFetch(`${MASTER_DATA_ENDPOINT}/positions/${id}`, { method: 'DELETE' }); }
// --- Funcionarios ---
export function getOfficials(): Promise<Official[]> { return apiFetch(`${MASTER_DATA_ENDPOINT}/officials`, {}, z.array(officialSchema)); }
export function createOfficial(data: { fullName: string; unitId: number; positionId: number; isActive: boolean }): Promise<Official> { return apiFetch(`${MASTER_DATA_ENDPOINT}/officials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }, officialSchema); }
export function updateOfficial(id: number, data: { fullName: string; unitId: number; positionId: number; isActive: boolean }): Promise<Official> { return apiFetch(`${MASTER_DATA_ENDPOINT}/officials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }, officialSchema); }
export function deleteOfficial(id: number): Promise<void> { return apiFetch(`${MASTER_DATA_ENDPOINT}/officials/${id}`, { method: 'DELETE' }); }