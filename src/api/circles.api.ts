import { apiFetch } from './client';
import { Circle } from '../types';

export const circlesApi = {
  getCircles: () => apiFetch<Circle[]>('/api/circles'),
  createCircle: (data: { name: string }) =>
    apiFetch<Circle>('/api/circles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  joinCircle: (data: { inviteCode: string }) =>
    apiFetch<Circle>('/api/circles/join', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
