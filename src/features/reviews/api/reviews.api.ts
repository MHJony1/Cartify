import { apiClient } from '@/lib/api/client';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export interface ReviewResponse {
  data: Review[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewsApi = {
  getProductReviews: async (productId: string, params?: { page?: number, limit?: number }) => {
    const response = await apiClient.get<{ data: ReviewResponse }>(`/reviews/product/${productId}`, {
      params
    });
    return response.data.data;
  },

  createReview: async (payload: { productId: string; rating: number; comment?: string }) => {
    const response = await apiClient.post<{ data: Review }>('/reviews', payload);
    return response.data.data; // Fixed to return .data.data depending on the interceptor, usually apiClient.post returns the axios response.
  }
};
