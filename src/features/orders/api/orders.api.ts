import { apiClient } from '@/lib/api/client';

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

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload) => {
    const response = await apiClient.post<{ data: OrderResponse }>('/orders', payload);
    return response.data;
  },
};
