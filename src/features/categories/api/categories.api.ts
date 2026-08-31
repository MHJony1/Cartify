import { apiClient } from '@/lib/api/client';
import { Category } from '@/features/products/types';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const categoriesApi = {
  getCategories: async () => {
    const response = await apiClient.get<{ data: Category[] }>('/categories');
    return response.data.data;
  },

  getCategoryById: async (id: string) => {
    const response = await apiClient.get<{ data: Category }>(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: { name: string; slug: string }) => {
    const response = await apiClient.post<{ data: Category }>('/categories', data);
    return response.data.data;
  },

  updateCategory: async ({ id, data }: { id: string; data: { name?: string; slug?: string } }) => {
    const response = await apiClient.patch<{ data: Category }>(`/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/categories/${id}`);
    return response.data;
  },
};
