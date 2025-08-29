import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  type LoginPayload,
  type User,
} from '../utils/api';
import { toast } from 'react-toastify';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (payload) => {
        console.log('[authStore] Iniciando login...');
        try {
          await apiLogin(payload); // Solo llama al login, no guarda token
          const user = await getMe(); // getMe ahora usa cookies automáticamente
          set({ user, isAuthenticated: true, isLoading: false });
          console.log('[authStore] Login exitoso. Estado actualizado:', { user });
          toast.success(`Bienvenido, ${user.email}`);
        } catch (error) {
          set({ isLoading: false });
          console.error('[authStore] Login fallido:', error);
          const message =
            error instanceof Error ? error.message : 'Credenciales incorrectas.';
          toast.error(message);
          throw error;
        }
      },

      logout: async () => {
        console.log('[authStore] Iniciando logout...');
        try {
          await apiLogout();
        } catch (error) {
          console.error('Logout en API falló:', error);
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
          console.log('[authStore] Estado de logout aplicado. Redirigiendo...');
          window.location.href = '/login';
        }
      },

      checkAuthStatus: async () => {
        console.log('[authStore] Verificando estado de autenticación...');
        try {
          const user = await getMe(); // getMe usa cookies automáticamente
          console.log('[authStore] getMe() exitoso. Estado: autenticado.', user);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('[authStore] getMe() falló. Estado: desautenticado.', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);