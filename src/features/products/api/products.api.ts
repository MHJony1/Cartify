import { apiClient } from '@/lib/api/client';
import { Product } from '../types';

export interface GetProductsParams {
  search?: string;
  categoryId?: string;
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
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params,
    });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },
};
