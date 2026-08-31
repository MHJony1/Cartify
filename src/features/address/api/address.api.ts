import { apiClient } from '@/lib/api/client';

export interface Address {
  id: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CreateAddressPayload {
  name: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  postalCode: string;
  isDefault?: boolean;
}

export const addressApi = {
  getMyAddresses: async () => {
    const response = await apiClient.get<{ data: Address[] }>('/addresses');
    return response.data;
  },

  createAddress: async (payload: CreateAddressPayload) => {
    const response = await apiClient.post<{ data: Address }>('/addresses', payload);
    return response.data;
  },

  updateAddress: async (id: string, payload: Partial<CreateAddressPayload>) => {
    const response = await apiClient.patch<{ data: Address }>(`/addresses/${id}`, payload);
    return response.data;
  },

  deleteAddress: async (id: string) => {
    const response = await apiClient.delete<{ data: Address }>(`/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id: string) => {
    const response = await apiClient.patch<{ data: Address }>(`/addresses/${id}/default`);
    return response.data;
  },
};
