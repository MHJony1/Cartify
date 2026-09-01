import { apiClient } from "@/lib/api/client";

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    overview: {
      totalUsers: number;
      totalProducts: number;
      totalCategories: number;
      totalOrders: number;
      totalRevenue: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      totalReviews: number;
    };
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
    recentOrders: any[];
    recentUsers: any[];
    inventoryAlerts: any[];
  };
}

export const adminApi = {
  getDashboardOverview: async () => {
    const response = await apiClient.get<DashboardOverviewResponse>("/admin/dashboard");
    return response.data;
  },
};
