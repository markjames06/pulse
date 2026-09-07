import { apiFetch } from './client';
import { PulseMoment } from '../types';

export const momentsApi = {
  getMoments: (circleId: string) =>
    apiFetch<PulseMoment[]>(`/api/moments?circleId=${encodeURIComponent(circleId)}`),
  createMoment: (data: { circleId: string; title: string; place: string; startsAt: string }) =>
    apiFetch<PulseMoment>('/api/moments', { method: 'POST', body: JSON.stringify(data) }),
};