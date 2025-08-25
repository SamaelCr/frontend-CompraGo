import { create } from 'zustand';
import { createOrder, type CreateOrderPayload, type ApiOrder } from '../utils/api';

export interface FormOrderItem {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderFormData {
  // Requisición
  memoDate: string;
  requestingUnit: string;
  responsibleOfficial: string;
  concept: string;
  // Cotización
  provider: string;
  documentType: string;
  budgetNumber: string;
  budgetDate: string;
  deliveryTime: string;
  offerQuality: string;
  priceInquiryType: string;
  // Campos Adicionales
  observations: string;
  hasIvaRetention: boolean;
  hasIslr: boolean;
  hasItf: boolean;
  signedById: number | null;
  // Ítems y Montos
  items: FormOrderItem[];
  baseAmount: number;
  ivaAmount: number;
  totalAmount: number;
  // Orden
  accountPointId: number | null;
}

interface OrderFormState {
  data: OrderFormData;
  setData: (data: Partial<OrderFormData>) => void;
  submitOrder: () => Promise<ApiOrder>;
  reset: () => void;
}

const initialState: OrderFormData = {
  memoDate: new Date().toISOString().split('T')[0],
  requestingUnit: '',
  responsibleOfficial: '',
  concept: '',
  provider: '',
  documentType: '',
  budgetNumber: '',
  budgetDate: new Date().toISOString().split('T')[0],
  deliveryTime: '',
  offerQuality: '',
  priceInquiryType: '',
  observations: '',
  hasIvaRetention: false,
  hasIslr: false,
  hasItf: false,
  signedById: null,
  items: [],
  baseAmount: 0,
  ivaAmount: 0,
  totalAmount: 0,
  accountPointId: null,
};

export const useOrderFormStore = create<OrderFormState>((set, get) => ({
  data: initialState,
  setData: (newData) => set(state => ({ data: { ...state.data, ...newData } })),
  submitOrder: async () => {
    const { data } = get();
    if (!data.accountPointId) {
      throw new Error('Debe seleccionar un punto de cuenta.');
    }
    if (data.items.length === 0) {
      throw new Error('Debe agregar al menos un ítem a la orden.');
    }
    if (!data.signedById) {
      throw new Error('Debe seleccionar quién firma la orden.');
    }
    if (!data.priceInquiryType) {
      throw new Error('Debe seleccionar el tipo de consulta de precio.');
    }

    const payload: CreateOrderPayload = {
      memoDate: data.memoDate,
      requestingUnit: data.requestingUnit,
      responsibleOfficial: data.responsibleOfficial,
      concept: data.concept,
      provider: data.provider,
      documentType: data.documentType,
      budgetNumber: data.budgetNumber,
      budgetDate: data.budgetDate,
      deliveryTime: data.deliveryTime,
      offerQuality: data.offerQuality,
      priceInquiryType: data.priceInquiryType,
      observations: data.observations,
      hasIvaRetention: data.hasIvaRetention,
      hasIslr: data.hasIslr,
      hasItf: data.hasItf,
      signedById: data.signedById,
      accountPointId: data.accountPointId,
      items: data.items.map(item => ({
        description: item.description,
        unit: item.unit,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };
    
    return await createOrder(payload); 
  },
  reset: () => set({ data: initialState }),
}));