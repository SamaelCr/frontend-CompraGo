import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_URL;

// =================================================================
// PROVEEDORES
// =================================================================

const providerSchema = z.object({
  id: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  name: z.string(),
  rif: z.string(),
  address: z.string(),
});

const providersSchema = z.array(providerSchema);

export type Provider = z.infer<typeof providerSchema>;

export async function getProviders(): Promise<Provider[]> {
  const response = await fetch(`${API_URL}/api/providers`);
  if (!response.ok) throw new Error('Failed to fetch providers');
  const data = await response.json();
  return providersSchema.parse(data);
}

export async function createProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
  const response = await fetch(`${API_URL}/api/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(provider),
  });
  if (!response.ok) throw new Error('Failed to create provider');
  const data = await response.json();
  return providerSchema.parse(data);
}

export async function updateProvider(id: number, provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
  const response = await fetch(`${API_URL}/api/providers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(provider),
  });
  if (!response.ok) throw new Error('Failed to update provider');
  const data = await response.json();
  return providerSchema.parse(data);
}

export async function deleteProvider(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/providers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete provider');
}



// =================================================================
// DATOS MAESTROS (Unidades, Cargos, Funcionarios)
// =================================================================

const MASTER_DATA_URL = `${API_URL}/api/master-data`;

// --- Schemas y Tipos ---

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


// --- Funciones de API para Unidades ---

export async function getUnits(): Promise<Unit[]> {
  const res = await fetch(`${MASTER_DATA_URL}/units`);
  if (!res.ok) throw new Error('Failed to fetch units');
  return z.array(unitSchema).parse(await res.json());
}
export async function createUnit(data: { name: string }): Promise<Unit> {
  const res = await fetch(`${MASTER_DATA_URL}/units`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create unit');
  return unitSchema.parse(await res.json());
}
export async function updateUnit(id: number, data: { name: string; isActive: boolean }): Promise<Unit> {
  const res = await fetch(`${MASTER_DATA_URL}/units/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update unit');
  return unitSchema.parse(await res.json());
}

export async function deleteUnit(id: number): Promise<void> {
  const res = await fetch(`${MASTER_DATA_URL}/units/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete unit');
  }
}

// --- Funciones de API para Cargos ---

export async function getPositions(): Promise<Position[]> {
  const res = await fetch(`${MASTER_DATA_URL}/positions`);
  if (!res.ok) throw new Error('Failed to fetch positions');
  return z.array(positionSchema).parse(await res.json());
}
export async function createPosition(data: { name: string }): Promise<Position> {
  const res = await fetch(`${MASTER_DATA_URL}/positions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create position');
  return positionSchema.parse(await res.json());
}
export async function updatePosition(id: number, data: { name: string; isActive: boolean }): Promise<Position> {
  const res = await fetch(`${MASTER_DATA_URL}/positions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update position');
  return positionSchema.parse(await res.json());
}
export async function deletePosition(id: number): Promise<void> {
  const res = await fetch(`${MASTER_DATA_URL}/positions/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete position');
  }
}

// --- Funciones de API para Funcionarios ---

export async function getOfficials(): Promise<Official[]> {
  const res = await fetch(`${MASTER_DATA_URL}/officials`);
  if (!res.ok) throw new Error('Failed to fetch officials');
  return z.array(officialSchema).parse(await res.json());
}
export async function createOfficial(data: { fullName: string; unitId: number; positionId: number }): Promise<Official> {
  const res = await fetch(`${MASTER_DATA_URL}/officials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create official');
  return officialSchema.parse(await res.json());
}
export async function updateOfficial(id: number, data: { fullName: string; unitId: number; positionId: number; isActive: boolean }): Promise<Official> {
  const res = await fetch(`${MASTER_DATA_URL}/officials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update official');
  return officialSchema.parse(await res.json());
}

export async function deleteOfficial(id: number): Promise<void> {
  const res = await fetch(`${MASTER_DATA_URL}/officials/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete official');
  }
}