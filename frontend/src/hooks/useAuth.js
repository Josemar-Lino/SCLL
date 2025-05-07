import { create } from 'zustand';
import api from '../services/api';

const useAuth = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  branches: [],
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    set({ token });
  },
  setBranches: (branches) => set({ branches }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (email, password, branchId) => {
    try {
      set({ loading: true, error: null });
      
      // Validar dados de entrada
      if (!email || !password || !branchId) {
        throw new Error('Todos os campos são obrigatórios');
      }

      const response = await api.post('/api/auth/login/', {
        email,
        password,
        branch: branchId,
      });

      const { token, user } = response.data;
      
      // Validar resposta
      if (!token || !user) {
        throw new Error('Resposta inválida do servidor');
      }

      set({ user, loading: false });
      get().setToken(token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao fazer login';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error; // Propagar o erro para o componente
    }
  },

  logout: () => {
    get().setToken(null);
    set({ user: null, error: null });
  },

  fetchBranches: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/api/branches/');
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Resposta inválida do servidor');
      }

      set({ branches: response.data, loading: false });
    } catch (error) {
      console.error('Fetch branches error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao carregar filiais';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error; // Propagar o erro para o componente
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/api/auth/me/');
        set({ token, user: response.data });
      } catch (error) {
        console.error('Auth check error:', error);
        get().logout(); // Limpar dados de autenticação em caso de erro
      }
    }
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put('/api/auth/profile/', data);
      set({ user: response.data, loading: false });
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar perfil';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },
}));

// Inicializar o token no carregamento
useAuth.getState().checkAuth();

export { useAuth }; 