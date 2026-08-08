import { apiFetch } from './client';
import { MemoryPin } from '../types';

export const memoryPinsApi = {
  getMemoryPins: (circleId?: string) =>
    apiFetch<MemoryPin[]>(`/api/memory-pins${circleId ? `?circleId=${circleId}` : ''}`),
  createMemoryPin: (data: {
    circleId: string;
    latitude: number;
    longitude: number;
    caption: string;
    emoji?: string;
  }) =>
    apiFetch<MemoryPin>('/api/memory-pins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteMemoryPin: (pinId: string) =>
    apiFetch<{ success: boolean }>(`/api/memory-pins/${pinId}`, {
      method: 'DELETE',
    }),
};
