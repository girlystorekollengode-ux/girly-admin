import { create } from 'zustand';
import api from '../api/axios.js';

export const useAuthStore = create((set) => ({
  admin: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.success) {
        const { user, accessToken } = data;

        if (user.role !== 'admin') {
          throw new Error('Not authorized as admin. Access denied.');
        }

        localStorage.setItem('accessToken', accessToken);
        set({ admin: user, accessToken, isLoading: false });
        return { success: true };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      set({ isLoading: false });
      const errorMsg = error.response?.data?.message || error.message || 'Server error during login';
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      set({ admin: null, accessToken: null, isLoading: false });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ admin: null, accessToken: null, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.user.role === 'admin') {
        set({ admin: data.user, accessToken: token, isLoading: false });
      } else {
        localStorage.removeItem('accessToken');
        set({ admin: null, accessToken: null, isLoading: false });
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ admin: null, accessToken: null, isLoading: false });
    }
  },
}));
