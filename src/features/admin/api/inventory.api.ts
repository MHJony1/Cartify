import { apiClient } from '@/lib/api/client';

export interface InventoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  stockStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  price: number;
}

export interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  category: {
    id: string;
    name: string;
  };
  totalStock: number;
  variants: InventoryVariant[];
  stockStatus: string;
}

export interface InventoryResponse {
  data: InventoryProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InventoryAnalytics {
  totalProducts: number;
  totalStockUnits: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: any[];
}

export const inventoryApi = {
  getInventory: async (params?: InventoryQuery) => {
    const { data } = await apiClient.get<{ success: boolean; data: InventoryResponse }>('/inventory', { params });
    return data.data;
  },

  getAnalytics: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: InventoryAnalytics }>('/admin/analytics/inventory');
    return data.data;
  },

  restock: async (productId: string, variantId: string, quantity: number, note?: string) => {
    const { data } = await apiClient.patch<{ success: boolean; data: any }>(`/inventory/${productId}/restock`, {
      variantId,
      quantity,
      note,
    });
    return data.data;
  },

  adjust: async (productId: string, variantId: string, operation: 'INCREASE' | 'DECREASE' | 'SET', quantity: number, note?: string) => {
    const { data } = await apiClient.patch<{ success: boolean; data: any }>(`/inventory/${productId}/adjust`, {
      variantId,
      operation,
      quantity,
      note,
    });
    return data.data;
  },

  damage: async (productId: string, variantId: string, quantity: number, note?: string) => {
    const { data } = await apiClient.patch<{ success: boolean; data: any }>(`/inventory/${productId}/damage`, {
      variantId,
      quantity,
      note,
    });
    return data.data;
  }
};
