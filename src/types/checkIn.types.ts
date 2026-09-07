import { z } from 'zod';
import { UserProfile } from './user.types';

export interface SafetyCheckIn {
  id: string;
  circleId: string;
  userId: string;
  status: 'active' | 'completed' | 'missed';
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
  userProfile?: UserProfile;
}

export const createSafetyCheckInSchema = z.object({
  circleId: z.string().min(1, 'Invalid circle ID'),
  durationMinutes: z.number().int().min(5).max(1440),
});