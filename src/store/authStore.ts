import { create } from 'zustand';
import type { User } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  loadProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, token: null });
        return;
      }
      const user = await authAPI.getProfile();
      set({ user, token });
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  }
})); 