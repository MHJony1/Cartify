import { apiClient } from '@/lib/api/client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  getNotifications: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: Notification[] }>('/notifications');
    return data.data;
  },

  getUnreadCount: async () => {
    const { data } = await apiClient.get<{ success: boolean; data: number }>('/notifications/unread-count');
    return data.data;
  },

  markAsRead: async (id: string) => {
    const { data } = await apiClient.patch<{ success: boolean; data: any }>(`/notifications/${id}/read`);
    return data.data;
  },

  markAllAsRead: async () => {
    const { data } = await apiClient.patch<{ success: boolean; data: any }>('/notifications/read-all');
    return data.data;
  },

  deleteNotification: async (id: string) => {
    const { data } = await apiClient.delete<{ success: boolean; data: any }>(`/notifications/${id}`);
    return data.data;
  },
};
