import { apiClient } from '@/lib/api/client';
import { Product } from '@/features/products/types';

export interface OrderItemPayload {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  shippingAddress?: string;
  addressId?: string;
  couponCode?: string;
  paymentMethod?: 'COD' | 'ONLINE';
}

export interface OrderResponse {
  id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  variantSize: string;
  variantColor: string;
  variantSku: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface OrderUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: OrderUser;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
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

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload) => {
    const response = await apiClient.post<{ data: OrderResponse }>('/orders', payload);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await apiClient.get<{ data: Order[] }>('/orders/my-orders');
    return response.data.data;
  },

  getSingleOrder: async (id: string) => {
    const response = await apiClient.get<{ data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  // Admin APIs
  getAllOrders: async (params?: GetOrdersParams) => {
    const response = await apiClient.get<{ data: PaginatedResponse<Order> }>('/orders', { params });
    return response.data.data;
  },

  adminGetSingleOrder: async (id: string) => {
    const response = await apiClient.get<{ data: Order }>(`/orders/admin/${id}`);
    return response.data.data;
  },

  updateOrderStatus: async ({ id, status }: { id: string; status: string }) => {
    const response = await apiClient.patch<{ data: Order }>(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  updatePaymentStatus: async ({ id, paymentStatus }: { id: string; paymentStatus: string }) => {
    const response = await apiClient.patch<{ data: Order }>(`/orders/${id}/payment-status`, { paymentStatus });
    return response.data.data;
  },
};
