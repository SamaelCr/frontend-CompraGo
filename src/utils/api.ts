// src/utils/api.ts

import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_URL;

// =================================================================
// FUNCIÓN AUXILIAR CENTRALIZADA (Sin cambios)
// =================================================================
async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.error?.message || JSON.stringify(errorData);
    } catch (e) {
      // Sin cambios
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (schema) {
    // MODIFICACIÓN: Añadimos un try-catch para dar un error más claro de Zod
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Error de validación de Zod:", error.issues);
        // Hacemos que el error sea más legible para el usuario
        throw new Error(`Los datos recibidos de la API no tienen el formato esperado: ${JSON.stringify(error.issues)}`);
      }
      throw error;
    }
  }

  return data as T;
}


// =================================================================
// DEFINICIONES DE SCHEMAS Y TIPOS (CON CAMBIOS)
// =================================================================

const providerSchema = z.object({
  id: z.number(),
  createdAt: z.string(), // MODIFICADO: De z.number() a z.string()
  updatedAt: z.string(), // MODIFICADO: De z.number() a z.string()
  name: z.string(),
  rif: z.string(),
  address: z.string(),
});
export type Provider = z.infer<typeof providerSchema>;
const providersSchema = z.array(providerSchema);

const unitSchema = z.object({
  id: z.number(),
  // Los modelos de Unit, Position y Official ahora también usan time.Time
  createdAt: z.string(), // MODIFICADO: Añadido para coincidir con el modelo de Go
  updatedAt: z.string(), // MODIFICADO: Añadido para coincidir con el modelo de Go
  name: z.string(),
  isActive: z.boolean(),
});
export type Unit = z.infer<typeof unitSchema>;

const positionSchema = z.object({
  id: z.number(),
  createdAt: z.string(), // MODIFICADO: Añadido para coincidir con el modelo de Go
  updatedAt: z.string(), // MODIFICADO: Añadido para coincidir con el modelo de Go
  name: z.string(),
  isActive: z.boolean(),
});
export type Position = z.infer<typeof positionSchema>;

const officialSchema = z.object({
  id: z.number(),
  createdAt: z.string(), // MODIFICADO: Añadido para coincidir con el modelo de Go
  updatedAt: z.string(), // MODIFICADO: Añadido para coincidir con el modelo de Go
  fullName: z.string(),
  isActive: z.boolean(),
  unitId: z.number(),
  unit: unitSchema.omit({ createdAt: true, updatedAt: true }), // Usamos omit para evitar redundancia en el tipo anidado
  positionId: z.number(),
  position: positionSchema.omit({ createdAt: true, updatedAt: true }), // Igual aquí
});
export type Official = z.infer<typeof officialSchema>;


// =================================================================
// FUNCIONES DE API REFACTORIZADAS (Sin cambios)
// =================================================================
const MASTER_DATA_URL = `${API_URL}/api/master-data`;

// --- Proveedores ---
export function getProviders(): Promise<Provider[]> {
  return apiFetch(`${API_URL}/api/providers`, {}, providersSchema);
}
// ... resto de funciones sin cambios ...
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