import { apiFetch } from './client';
import { Ping } from '../types';

export const pingsApi = {
  getPings: (circleId?: string) =>
    apiFetch<Ping[]>(`/api/pings${circleId ? `?circleId=${circleId}` : ''}`),
  sendPing: (data: {
    circleId: string;
    message: string;
    latitude?: number;
    longitude?: number;
  }) =>
    apiFetch<Ping>('/api/pings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
