import api from '../../../services/api/axios';
import type { AuthResponse } from '../../../types/api';

export const adminApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};
