import { apiFetch } from './client';
import { NotificationItem } from '../types';

export const notificationsApi = {
  getNotifications: (circleId?: string) =>
    apiFetch<NotificationItem[]>(
      `/api/notifications${circleId ? `?circleId=${circleId}` : ''}`
    ),
};
