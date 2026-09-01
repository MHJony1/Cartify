import { apiClient } from "@/lib/api/client";

export interface ICoupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponPayload {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive?: boolean;
}

export const adminCouponsApi = {
  getCoupons: async (): Promise<ICoupon[]> => {
    const response = await apiClient.get<{ data: ICoupon[] }>("/admin/coupons");
    return response.data.data;
  },

  getCouponById: async (id: string): Promise<ICoupon> => {
    const response = await apiClient.get<{ data: ICoupon }>(`/admin/coupons/${id}`);
    return response.data.data;
  },

  createCoupon: async (payload: CouponPayload): Promise<ICoupon> => {
    const response = await apiClient.post<{ data: ICoupon }>("/admin/coupons", payload);
    return response.data.data;
  },

  updateCoupon: async (id: string, payload: Partial<CouponPayload>): Promise<ICoupon> => {
    const response = await apiClient.patch<{ data: ICoupon }>(`/admin/coupons/${id}`, payload);
    return response.data.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/coupons/${id}`);
  },

  toggleStatus: async (id: string): Promise<ICoupon> => {
    const response = await apiClient.patch<{ data: ICoupon }>(`/admin/coupons/${id}/toggle-status`);
    return response.data.data;
  },
};
