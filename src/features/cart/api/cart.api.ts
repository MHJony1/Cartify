import { apiClient } from '@/lib/api/client';

export interface AddToCartPayload {
  productId: string;
  variantId: string;
  quantity: number;
}

export const cartApi = {
  clearCart: async () => {
    const response = await apiClient.delete('/carts');
    return response.data;
  },

  addToCart: async (payload: AddToCartPayload) => {
    const response = await apiClient.post('/carts', payload);
    return response.data;
  },
};
