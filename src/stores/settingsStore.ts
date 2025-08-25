import { create } from 'zustand';
import { getIvaPercentage } from '../utils/api';

interface SettingsState {
  ivaPercentage: number;
  isLoading: boolean;
  error: string | null;
  fetchIvaPercentage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ivaPercentage: 16, // Valor por defecto hasta que se cargue el real
  isLoading: true,
  error: null,
  fetchIvaPercentage: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getIvaPercentage();
      set({ ivaPercentage: data.ivaPercentage, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar el IVA';
      set({ error: message, isLoading: false });
    }
  },
}));