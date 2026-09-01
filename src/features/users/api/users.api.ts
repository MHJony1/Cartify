import { apiClient } from '@/lib/api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
  addresses?: any[];
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface PaginatedUserResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  adminGetAllUsers: async (params?: GetUsersParams) => {
    const response = await apiClient.get<{ data: PaginatedUserResponse }>('/auth/admin', { params });
    return response.data.data;
  },

  adminGetSingleUser: async (id: string) => {
    const response = await apiClient.get<{ data: User }>(`/auth/admin/${id}`);
    return response.data.data;
  },

  adminUpdateUserStatus: async ({ id, status }: { id: string; status: string }) => {
    const response = await apiClient.patch<{ data: User }>(`/auth/admin/${id}/status`, { status });
    return response.data.data;
  },

  adminUpdateUserRole: async ({ id, role }: { id: string; role: string }) => {
    const response = await apiClient.patch<{ data: User }>(`/auth/admin/${id}/role`, { role });
    return response.data.data;
  },
};
