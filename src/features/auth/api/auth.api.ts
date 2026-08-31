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

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await apiClient.get<any>('/auth/me');
      return data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // If backend says unauthorized, the cookie is invalid.
        // We MUST ask the backend to clear the cookie so proxy.ts stops seeing it.
        try {
          await apiClient.post('/auth/logout');
        } catch (e) {
          // Ignore logout errors during 401 cleanup
        }
        return null; // Return null gracefully instead of throwing
      }
      throw error;
    }
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

  updateProfile: async (id: string, payload: { name?: string; phone?: string; image?: string; }): Promise<User> => {
    const { data } = await apiClient.patch<any>(`/auth/${id}`, payload);
    return data.data;
  },
};
