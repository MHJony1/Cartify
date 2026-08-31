import { apiClient } from "@/lib/api/client";

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    totalUsers: number;
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    orders: {
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
    payments: {
      paid: number;
      completed: number;
      pending: number;
      failed: number;
      refunded: number;
    };
    totalRevenue: number;
    inventory: {
      lowStock: number;
      outOfStock: number;
    };
    totalReviews: number;
  };
}

export const adminApi = {
  getDashboardOverview: async () => {
    const response = await apiClient.get<DashboardOverviewResponse>("/admin/dashboard");
    return response.data;
  },
};
