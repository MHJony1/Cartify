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

export interface Order {
  id: string;
  userId: string;
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
  }
};
