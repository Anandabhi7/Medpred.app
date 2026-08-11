import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

interface User {
  name: string;
  username: string;
  age: number;
  weight_kg: number;
  height_cm: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.post('/api/auth/login', { username, password });
      if (res.data?.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        set({
          user: res.data.user,
          token: res.data.token,
          loading: false,
        });
        return true;
      }
      set({ error: res.data?.error || 'Login failed', loading: false });
      return false;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Invalid credentials or connection error',
        loading: false,
      });
      return false;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.post('/api/auth/register', data);
      if (res.data?.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        set({
          user: res.data.user,
          token: res.data.token,
          loading: false,
        });
        return true;
      }
      set({ error: res.data?.error || 'Registration failed', loading: false });
      return false;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Registration failed',
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.post('/api/user/update', data);
      if (res.data?.success) {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...data } as User,
            loading: false,
          });
        }
        return true;
      }
      set({ error: 'Failed to update profile', loading: false });
      return false;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to update profile',
        loading: false,
      });
      return false;
    }
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const res = await axiosClient.get('/api/auth/me');
      if (res.data?.success) {
        set({ user: res.data.user, token, initialized: true });
      } else {
        localStorage.removeItem('token');
        set({ user: null, token: null, initialized: true });
      }
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, initialized: true });
    }
  },

  clearError: () => set({ error: null }),
}));
