import { apiFetch } from './client';
import { LocationShare } from '../types';

export const sharesApi = {
  getShares: (circleId?: string) =>
    apiFetch<LocationShare[]>(`/api/shares${circleId ? `?circleId=${circleId}` : ''}`),
  startShare: (data: {
    circleId: string;
    latitude: number;
    longitude: number;
    durationMinutes: number;
    label?: string;
  }) =>
    apiFetch<LocationShare>('/api/shares', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  stopShare: (shareId: string) =>
    apiFetch<{ success: boolean }>(`/api/shares/${shareId}`, {
      method: 'DELETE',
    }),
  updateLocation: (shareId: string, data: { latitude: number; longitude: number }) =>
    apiFetch<LocationShare>(`/api/shares/${shareId}/location`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
