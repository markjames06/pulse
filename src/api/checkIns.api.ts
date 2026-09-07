import { apiFetch } from './client';
import { SafetyCheckIn } from '../types';

export const checkInsApi = {
  getSafetyCheckIns: (circleId: string) =>
    apiFetch<SafetyCheckIn[]>(`/api/check-ins?circleId=${encodeURIComponent(circleId)}`),
  startSafetyCheckIn: (circleId: string, durationMinutes: number) =>
    apiFetch<SafetyCheckIn>('/api/check-ins', {
      method: 'POST',
      body: JSON.stringify({ circleId, durationMinutes }),
    }),
  completeSafetyCheckIn: (checkInId: string) =>
    apiFetch<SafetyCheckIn>(`/api/check-ins/${checkInId}/complete`, { method: 'POST' }),
};
