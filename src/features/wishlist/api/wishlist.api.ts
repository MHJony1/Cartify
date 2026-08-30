import { apiClient } from '@/lib/api/client';
import { Product } from '@/features/products/types';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: Omit<Product, 'images'> & { image: string | null };
}

export const wishlistApi = {
  getMyWishlist: async () => {
    const response = await apiClient.get<{ data: WishlistItem[] }>('/wishlists');
    return response.data.data;
  },
  
  addToWishlist: async (productId: string) => {
    const response = await apiClient.post(`/wishlists/${productId}`);
    return response.data;
  },
  
  removeFromWishlist: async (productId: string) => {
    const response = await apiClient.delete(`/wishlists/${productId}`);
    return response.data;
  },
  
  moveToCart: async (productId: string) => {
    const response = await apiClient.patch(`/wishlists/${productId}/move-to-cart`);
    return response.data;
  }
};
