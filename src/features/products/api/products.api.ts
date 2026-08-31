import { apiClient } from '@/lib/api/client';
import { Product } from '../types';

export interface GetProductsParams {
  search?: string;
  categoryId?: string;
  gender?: string;
  collection?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const productsApi = {
  getProducts: async (params?: GetProductsParams) => {
    const response = await apiClient.get<{ data: PaginatedResponse<Product> }>('/products', {
      params,
    });
    return response.data.data; // Note: returns the PaginatedResponse object, not just array
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  createProduct: async (data: any) => {
    const response = await apiClient.post<{ data: Product }>('/products', data);
    return response.data.data;
  },

  updateProduct: async ({ id, data }: { id: string; data: any }) => {
    const response = await apiClient.patch<{ data: Product }>(`/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/products/${id}`);
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<{ data: { url: string } }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.url;
  },
};
