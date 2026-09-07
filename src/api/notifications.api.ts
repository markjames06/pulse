import { apiFetch } from './client';
import { NotificationItem } from '../types';

export const notificationsApi = {
  getNotifications: (circleId?: string) =>
    apiFetch<NotificationItem[]>(
      `/api/notifications${circleId ? `?circleId=${circleId}` : ''}`
    ),
  markAllRead: (circleId?: string) =>
    apiFetch<{ updated: number }>('/api/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ circleId }),
    }),
};
