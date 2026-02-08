import { apiRequest } from './api';

export async function getNotifications() {
  return apiRequest<{ notifications: any[] }>('/notifications');
}

export async function getUnreadCount() {
  return apiRequest<{ count: number }>('/notifications/unread-count');
}

export async function markNotificationRead(id: string) {
  return apiRequest<{ notification: any }>(`/notifications/${id}/read`, { method: 'PUT' });
}
