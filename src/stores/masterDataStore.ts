import { create } from 'zustand';
import {
  type Unit,
  type Position,
  type Official,
  type Provider,
  type AccountPoint,
  type Product, // NUEVO
  getUnits,
  getPositions,
  getOfficials,
  getProviders,
  getAccountPoints,
  getProducts, // NUEVO
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
  createAccountPoint as apiCreateAccountPoint,
  updateAccountPoint as apiUpdateAccountPoint,
  deleteAccountPoint as apiDeleteAccountPoint,
  createProduct as apiCreateProduct, // NUEVO
  updateProduct as apiUpdateProduct, // NUEVO
  deleteProduct as apiDeleteProduct, // NUEVO
} from '../utils/api';

interface MasterDataState {
  units: Unit[];
  positions: Position[];
  officials: Official[];
  providers: Provider[];
  accountPoints: AccountPoint[];
  products: Product[]; // NUEVO

  loading: Record<keyof MasterDataSets, boolean>;
  error: Record<keyof MasterDataSets, string | null>;

  fetchUnits: (force?: boolean) => Promise<void>;
  fetchPositions: (force?: boolean) => Promise<void>;
  fetchOfficials: (force?: boolean) => Promise<void>;
  fetchProviders: (force?: boolean) => Promise<void>;
  fetchAccountPoints: (force?: boolean) => Promise<void>;
  fetchProducts: (force?: boolean) => Promise<void>; // NUEVO

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
  
  createAccountPoint: (data: any) => Promise<AccountPoint>;
  updateAccountPoint: (id: number, data: any) => Promise<AccountPoint>;
  deleteAccountPoint: (id: number) => Promise<void>;
  
  createProduct: (data: { name: string; unit: string; isActive: boolean }) => Promise<Product>; // NUEVO
  updateProduct: (id: number, data: { name: string; unit: string; isActive: boolean }) => Promise<Product>; // NUEVO
  deleteProduct: (id: number) => Promise<void>; // NUEVO
}

type MasterDataSets = {
  units: Unit[];
  positions: Position[];
  officials: Official[];
  providers: Provider[];
  accountPoints: AccountPoint[];
  products: Product[]; // NUEVO
};

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

export const useMasterDataStore = create<MasterDataState>((set, get) => ({
  units: [],
  positions: [],
  officials: [],
  providers: [],
  accountPoints: [],
  products: [], // NUEVO
  loading: { units: false, positions: false, officials: false, providers: false, accountPoints: false, products: false }, // NUEVO
  error: { units: null, positions: null, officials: null, providers: null, accountPoints: null, products: null }, // NUEVO

  fetchUnits: createFetcher(set, get, 'units', getUnits),
  fetchPositions: createFetcher(set, get, 'positions', getPositions),
  fetchOfficials: createFetcher(set, get, 'officials', getOfficials),
  fetchProviders: createFetcher(set, get, 'providers', getProviders),
  fetchAccountPoints: createFetcher(set, get, 'accountPoints', getAccountPoints),
  fetchProducts: createFetcher(set, get, 'products', getProducts), // NUEVO

  // ... (CRUDs de Unit, Position, Official, Provider, AccountPoint sin cambios) ...
  // Units
  createUnit: async (data) => {
    const newUnit = await apiCreateUnit(data);
    set(state => ({ units: [...state.units, newUnit].sort((a, b) => a.name.localeCompare(b.name)) }));
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

  // Positions
  createPosition: async (data) => {
    const newPosition = await apiCreatePosition(data);
    set(state => ({ positions: [...state.positions, newPosition].sort((a, b) => a.name.localeCompare(b.name)) }));
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

  // Officials
  createOfficial: async (data) => {
    const newOfficial = await apiCreateOfficial(data);
    set(state => ({
      officials: [...state.officials, newOfficial].sort((a, b) => a.fullName.localeCompare(b.fullName))
    }));
    return newOfficial;
  },
  updateOfficial: async (id, data) => {
    const updatedOfficial = await apiUpdateOfficial(id, data);
    set(state => ({
      officials: state.officials.map(o => o.id === id ? updatedOfficial : o)
    }));
    return updatedOfficial;
  },
  deleteOfficial: async (id) => {
    await apiDeleteOfficial(id);
    set(state => ({ officials: state.officials.filter(o => o.id !== id) }));
  },
  
  // Providers
  createProvider: async (data) => {
    const newProvider = await apiCreateProvider(data);
    set(state => ({ providers: [...state.providers, newProvider].sort((a, b) => a.name.localeCompare(b.name)) }));
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

  // Account Points
  createAccountPoint: async (data) => {
    const newAP = await apiCreateAccountPoint(data);
    set(state => ({ accountPoints: [...state.accountPoints, newAP].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }));
    return newAP;
  },
  updateAccountPoint: async (id, data) => {
    const updatedAP = await apiUpdateAccountPoint(id, data);
    set(state => ({
      accountPoints: state.accountPoints.map(ap => ap.id === id ? updatedAP : ap)
    }));
    return updatedAP;
  },
  deleteAccountPoint: async (id) => {
    await apiDeleteAccountPoint(id);
    set(state => ({ accountPoints: state.accountPoints.filter(ap => ap.id !== id) }));
  },

  // NUEVO: Products
  createProduct: async (data) => {
    const newProduct = await apiCreateProduct(data);
    set(state => ({ products: [...state.products, newProduct].sort((a, b) => a.name.localeCompare(b.name)) }));
    return newProduct;
  },
  updateProduct: async (id, data) => {
    const updatedProduct = await apiUpdateProduct(id, data);
    set(state => ({
      products: state.products.map(p => p.id === id ? updatedProduct : p)
    }));
    return updatedProduct;
  },
  deleteProduct: async (id) => {
    await apiDeleteProduct(id);
    set(state => ({ products: state.products.filter(p => p.id !== id) }));
  },
}));