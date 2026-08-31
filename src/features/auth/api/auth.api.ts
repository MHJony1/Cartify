import { apiClient } from '@/lib/api/client';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<any>('/auth/login', credentials);
    return data.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { firstName, lastName, ...rest } = credentials;
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    
    const payload = {
      ...rest,
      name,
    };
    const { data } = await apiClient.post<any>('/auth/register', payload);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<any>('/auth/me');
    return data.data;
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<any>('/auth/google', { credential });
    return data.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.post<any>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data.url;
  },
};
