import { apiClient } from "@/lib/api/client";

export interface IReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
  };
}

export interface IReviewQuery {
  page?: number;
  limit?: number;
  productId?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReviewListResponse {
  data: IReview[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminReviewsApi = {
  getReviews: async (params?: IReviewQuery): Promise<ReviewListResponse> => {
    const response = await apiClient.get<{ data: ReviewListResponse }>("/reviews", { params });
    return response.data.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};
