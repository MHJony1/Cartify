import { apiClient } from '@/lib/api/client';

export interface CreatePaymentPayload {
  orderId: string;
  method: 'COD' | 'ONLINE';
}

export interface PaymentResponse {
  id: string;
  status: string;
}

export const paymentApi = {
  createPayment: async (payload: CreatePaymentPayload) => {
    const response = await apiClient.post<{ data: PaymentResponse }>('/payments/create', payload);
    return response.data;
  },
};
