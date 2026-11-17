import { create } from 'zustand';

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: 'ASSISTANT' | 'CLIENT';
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  isAuthenticated: !!sessionStorage.getItem('user'),
  isLoading: false,

  login: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
