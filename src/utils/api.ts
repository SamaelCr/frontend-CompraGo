// src/utils/api.ts

import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_URL;

// =================================================================
// FUNCIÓN AUXILIAR CENTRALIZADA
// =================================================================

/**
 * Realiza una petición fetch a la API, manejando centralizadamente la respuesta
 * y los errores.
 * @param url La URL completa del endpoint.
 * @param options Opciones de Fetch (method, headers, body, etc.).
 * @param schema El schema de Zod para validar y tipar la respuesta exitosa.
 * @returns Una promesa que resuelve con los datos validados.
 */
async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await fetch(url, options);

  // Manejo centralizado de errores
  if (!response.ok) {
    let errorMessage = `Error: ${response.status} ${response.statusText}`;
    try {
      // Intentamos obtener un mensaje de error más específico del backend.
      // Basado en `utils/response.go`, el formato es { error: { message: "..." } }
      const errorData = await response.json();
      errorMessage = errorData?.error?.message || JSON.stringify(errorData);
    } catch (e) {
      // Si el cuerpo del error no es JSON, nos quedamos con el mensaje de estado.
    }
    throw new Error(errorMessage);
  }
  
  // Para peticiones DELETE exitosas que no devuelven contenido (status 204)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  // Si se proporciona un schema, validamos la respuesta.
  if (schema) {
    return schema.parse(data);
  }

  return data as T;
}


// =================================================================
// DEFINICIONES DE SCHEMAS Y TIPOS (sin cambios)
// =================================================================

const providerSchema = z.object({
  id: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  name: z.string(),
  rif: z.string(),
  address: z.string(),
});
export type Provider = z.infer<typeof providerSchema>;
const providersSchema = z.array(providerSchema);

const unitSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
});
export type Unit = z.infer<typeof unitSchema>;

const positionSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
});
export type Position = z.infer<typeof positionSchema>;

const officialSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  isActive: z.boolean(),
  unitId: z.number(),
  unit: unitSchema,
  positionId: z.number(),
  position: positionSchema,
});
export type Official = z.infer<typeof officialSchema>;


// =================================================================
// FUNCIONES DE API REFACTORIZADAS
// =================================================================

const MASTER_DATA_URL = `${API_URL}/api/master-data`;

// --- Proveedores ---
export function getProviders(): Promise<Provider[]> {
  return apiFetch(`${API_URL}/api/providers`, {}, providersSchema);
}

export function createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
  return apiFetch(`${API_URL}/api/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(provider),
  }, providerSchema);
}

export function updateProvider(id: number, provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
  return apiFetch(`${API_URL}/api/providers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(provider),
  }, providerSchema);
}

export function deleteProvider(id: number): Promise<void> {
  return apiFetch(`${API_URL}/api/providers/${id}`, { method: 'DELETE' });
}


// --- Unidades ---
export function getUnits(): Promise<Unit[]> {
  return apiFetch(`${MASTER_DATA_URL}/units`, {}, z.array(unitSchema));
}

export function createUnit(data: { name: string; isActive: boolean }): Promise<Unit> {
  return apiFetch(`${MASTER_DATA_URL}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, unitSchema);
}

export function updateUnit(id: number, data: { name: string; isActive: boolean }): Promise<Unit> {
  return apiFetch(`${MASTER_DATA_URL}/units/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, unitSchema);
}

export function deleteUnit(id: number): Promise<void> {
  return apiFetch(`${MASTER_DATA_URL}/units/${id}`, { method: 'DELETE' });
}


// --- Cargos ---
export function getPositions(): Promise<Position[]> {
  return apiFetch(`${MASTER_DATA_URL}/positions`, {}, z.array(positionSchema));
}

export function createPosition(data: { name: string; isActive: boolean }): Promise<Position> {
  return apiFetch(`${MASTER_DATA_URL}/positions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, positionSchema);
}

export function updatePosition(id: number, data: { name: string; isActive: boolean }): Promise<Position> {
  return apiFetch(`${MASTER_DATA_URL}/positions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, positionSchema);
}

export function deletePosition(id: number): Promise<void> {
  return apiFetch(`${MASTER_DATA_URL}/positions/${id}`, { method: 'DELETE' });
}


// --- Funcionarios ---
export function getOfficials(): Promise<Official[]> {
  return apiFetch(`${MASTER_DATA_URL}/officials`, {}, z.array(officialSchema));
}

export function createOfficial(data: { fullName: string; unitId: number; positionId: number; isActive: boolean }): Promise<Official> {
  return apiFetch(`${MASTER_DATA_URL}/officials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, officialSchema);
}

export function updateOfficial(id: number, data: { fullName: string; unitId: number; positionId: number; isActive: boolean }): Promise<Official> {
  return apiFetch(`${MASTER_DATA_URL}/officials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, officialSchema);
}

export function deleteOfficial(id: number): Promise<void> {
  return apiFetch(`${MASTER_DATA_URL}/officials/${id}`, { method: 'DELETE' });
}