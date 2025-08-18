import { z } from 'zod';

const API_URL = import.meta.env.PUBLIC_API_URL;

// Esquema de Zod para un proveedor
const providerSchema = z.object({
  id: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
  name: z.string(),
  rif: z.string(),
  address: z.string(),
});

// Esquema para un array de proveedores
const providersSchema = z.array(providerSchema);

export type Provider = z.infer<typeof providerSchema>;

// --- Funciones de la API ---

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