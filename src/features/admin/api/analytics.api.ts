import { apiClient } from "@/lib/api/client";

export interface AnalyticsQuery {
  period?: "7d" | "30d" | "90d" | "1y" | "custom";
  from?: string;
  to?: string;
  limit?: string;
  page?: string;
}

export interface SalesAnalyticsResponse {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  };
  timeline: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface OrderAnalyticsResponse {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface CustomerAnalyticsResponse {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  newUsersWithinPeriod: number;
}

export interface ProductAnalyticsResponse {
  totalProducts: number;
  activeProducts: number;
  deletedProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  topSelling: {
    productId: string;
    name: string;
    totalQuantitySold: number;
    revenue: number;
  }[];
}

export interface InventoryAnalyticsResponse {
  totalProducts: number;
  totalStockUnits: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: {
    product: string;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    previousStock: number;
    newStock: number;
    date: string;
  }[];
}

export interface PaymentAnalyticsResponse {
  totalPayments: number;
  pending: number;
  paid: number;
  completed: number;
  failed: number;
  refunded: number;
  methods: {
    cod: number;
    online: number;
  };
  amounts: {
    totalPaid: number;
    totalPending: number;
    totalRefunded: number;
  };
}

export interface ReviewAnalyticsResponse {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    "5 stars": number;
    "4 stars": number;
    "3 stars": number;
    "2 stars": number;
    "1 star": number;
  };
}

export interface CouponAnalyticsResponse {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalCouponUsage: number;
  totalDiscountGiven: number;
}

export const analyticsApi = {
  getSales: async (params?: AnalyticsQuery): Promise<SalesAnalyticsResponse> => {
    const response = await apiClient.get<{ data: SalesAnalyticsResponse }>("/admin/analytics/sales", { params });
    return response.data.data;
  },

  getOrders: async (params?: AnalyticsQuery): Promise<OrderAnalyticsResponse> => {
    const response = await apiClient.get<{ data: OrderAnalyticsResponse }>("/admin/analytics/orders", { params });
    return response.data.data;
  },

  getCustomers: async (params?: AnalyticsQuery): Promise<CustomerAnalyticsResponse> => {
    const response = await apiClient.get<{ data: CustomerAnalyticsResponse }>("/admin/analytics/customers", { params });
    return response.data.data;
  },

  getProducts: async (params?: AnalyticsQuery): Promise<ProductAnalyticsResponse> => {
    const response = await apiClient.get<{ data: ProductAnalyticsResponse }>("/admin/analytics/products", { params });
    return response.data.data;
  },

  getInventory: async (): Promise<InventoryAnalyticsResponse> => {
    // Inventory endpoint does not take query parameters in backend
    const response = await apiClient.get<{ data: InventoryAnalyticsResponse }>("/admin/analytics/inventory");
    return response.data.data;
  },

  getPayments: async (params?: AnalyticsQuery): Promise<PaymentAnalyticsResponse> => {
    const response = await apiClient.get<{ data: PaymentAnalyticsResponse }>("/admin/analytics/payments", { params });
    return response.data.data;
  },

  getReviews: async (params?: AnalyticsQuery): Promise<ReviewAnalyticsResponse> => {
    const response = await apiClient.get<{ data: ReviewAnalyticsResponse }>("/admin/analytics/reviews", { params });
    return response.data.data;
  },

  getCoupons: async (params?: AnalyticsQuery): Promise<CouponAnalyticsResponse> => {
    const response = await apiClient.get<{ data: CouponAnalyticsResponse }>("/admin/analytics/coupons", { params });
    return response.data.data;
  },
};
