import { apiClient } from '@/lib/api/client';

export interface CouponResponse {
  discountAmount: number;
  message: string;
}

export const couponApi = {
  applyCoupon: async (code: string) => {
    // Expected to return discount details from the backend
    const response = await apiClient.post<{ data: CouponResponse }>('/coupons/apply', { code });
    return response.data;
  },
};
