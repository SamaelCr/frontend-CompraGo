import { create } from 'zustand';
import {
  type Unit,
  type Position,
  type Official,
  type Provider,
  getUnits,
  getPositions,
  getOfficials,
  getProviders,
  createUnit as apiCreateUnit,
  updateUnit as apiUpdateUnit,
  deleteUnit as apiDeleteUnit,
  createPosition as apiCreatePosition,
  updatePosition as apiUpdatePosition,
  deletePosition as apiDeletePosition,
  createOfficial as apiCreateOfficial,
  updateOfficial as apiUpdateOfficial,
  deleteOfficial as apiDeleteOfficial,
  createProvider as apiCreateProvider,
  updateProvider as apiUpdateProvider,
  deleteProvider as apiDeleteProvider,
} from '../utils/api';

// 1. Definimos la forma del estado
interface MasterDataState {
  // Datos
  units: Unit[];
  positions: Position[];
  officials: Official[];
  providers: Provider[];

  // Estado de carga y errores
  loading: Record<keyof MasterDataSets, boolean>;
  error: Record<keyof MasterDataSets, string | null>;

  // Acciones para cargar datos
  fetchUnits: (force?: boolean) => Promise<void>;
  fetchPositions: (force?: boolean) => Promise<void>;
  fetchOfficials: (force?: boolean) => Promise<void>;
  fetchProviders: (force?: boolean) => Promise<void>;

  // Acciones CRUD que interactúan con la API y actualizan el store
  createUnit: (data: { name: string; isActive: boolean }) => Promise<Unit>;
  updateUnit: (id: number, data: { name: string; isActive: boolean }) => Promise<Unit>;
  deleteUnit: (id: number) => Promise<void>;

  createPosition: (data: { name: string; isActive: boolean }) => Promise<Position>;
  updatePosition: (id: number, data: { name: string; isActive: boolean }) => Promise<Position>;
  deletePosition: (id: number) => Promise<void>;

  createOfficial: (data: { fullName: string; unitId: number; positionId: number; isActive: boolean }) => Promise<Official>;
  updateOfficial: (id: number, data: { fullName: string; unitId: number; positionId: number; isActive: boolean }) => Promise<Official>;
  deleteOfficial: (id: number) => Promise<void>;

  createProvider: (data: { name: string; rif: string; address: string }) => Promise<Provider>;
  updateProvider: (id: number, data: { name: string; rif: string; address: string }) => Promise<Provider>;
  deleteProvider: (id: number) => Promise<void>;
}

type MasterDataSets = {
  units: Unit[];
  positions: Position[];
  officials: Official[];
  providers: Provider[];
};

// Helper para manejar el fetch genérico
const createFetcher = <K extends keyof MasterDataSets>(
  set: (fn: (state: MasterDataState) => Partial<MasterDataState>) => void,
  get: () => MasterDataState,
  key: K,
  fetcher: () => Promise<MasterDataSets[K]>
) => async (force = false) => {
  if (!force && get()[key].length > 0) return;

  set(state => ({ loading: { ...state.loading, [key]: true } }));
  try {
    const data = await fetcher();
    set(state => ({
      [key]: data,
      error: { ...state.error, [key]: null },
    }));
  } catch (err) {
    set(state => ({ error: { ...state.error, [key]: (err as Error).message } }));
  } finally {
    set(state => ({ loading: { ...state.loading, [key]: false } }));
  }
};

// 2. Creamos el store con Zustand
export const useMasterDataStore = create<MasterDataState>((set, get) => ({
  // Estado inicial
  units: [],
  positions: [],
  officials: [],
  providers: [],
  loading: { units: false, positions: false, officials: false, providers: false },
  error: { units: null, positions: null, officials: null, providers: null },

  // Implementación de las acciones de carga
  fetchUnits: createFetcher(set, get, 'units', getUnits),
  fetchPositions: createFetcher(set, get, 'positions', getPositions),
  fetchOfficials: createFetcher(set, get, 'officials', getOfficials),
  fetchProviders: createFetcher(set, get, 'providers', getProviders),

  // Acciones CRUD
  createUnit: async (data) => {
    const newUnit = await apiCreateUnit(data);
    set(state => ({ units: [...state.units, newUnit] }));
    return newUnit;
  },
  updateUnit: async (id, data) => {
    const updatedUnit = await apiUpdateUnit(id, data);
    set(state => ({
      units: state.units.map(u => u.id === id ? updatedUnit : u)
    }));
    return updatedUnit;
  },
  deleteUnit: async (id) => {
    await apiDeleteUnit(id);
    set(state => ({ units: state.units.filter(u => u.id !== id) }));
  },

  createPosition: async (data) => {
    const newPosition = await apiCreatePosition(data);
    set(state => ({ positions: [...state.positions, newPosition] }));
    return newPosition;
  },
  updatePosition: async (id, data) => {
    const updatedPosition = await apiUpdatePosition(id, data);
    set(state => ({
      positions: state.positions.map(p => p.id === id ? updatedPosition : p)
    }));
    return updatedPosition;
  },
  deletePosition: async (id) => {
    await apiDeletePosition(id);
    set(state => ({ positions: state.positions.filter(p => p.id !== id) }));
  },

  createOfficial: async (data) => {
    const newOfficial = await apiCreateOfficial(data);
    await get().fetchOfficials(true); // Recargar para obtener datos pre-cargados (Unit, Position)
    return newOfficial;
  },
  updateOfficial: async (id, data) => {
    const updatedOfficial = await apiUpdateOfficial(id, data);
    await get().fetchOfficials(true); // Recargar
    return updatedOfficial;
  },
  deleteOfficial: async (id) => {
    await apiDeleteOfficial(id);
    set(state => ({ officials: state.officials.filter(o => o.id !== id) }));
  },
  
  createProvider: async (data) => {
    const newProvider = await apiCreateProvider(data);
    set(state => ({ providers: [...state.providers, newProvider] }));
    return newProvider;
  },
  updateProvider: async (id, data) => {
    const updatedProvider = await apiUpdateProvider(id, data);
    set(state => ({
      providers: state.providers.map(p => p.id === id ? updatedProvider : p)
    }));
    return updatedProvider;
  },
  deleteProvider: async (id) => {
    await apiDeleteProvider(id);
    set(state => ({ providers: state.providers.filter(p => p.id !== id) }));
  },
}));