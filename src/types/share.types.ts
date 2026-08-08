import { z } from 'zod';
import { UserProfile } from './user.types';

export interface LocationShare {
  id: string;
  userId: string;
  circleId: string;
  latitude: number;
  longitude: number;
  label?: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
  userProfile?: UserProfile;
}

export const createShareSchema = z.object({
  circleId: z.string().min(1, 'Invalid circle ID'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  durationMinutes: z.number().int().positive().max(1440, 'Max share duration is 24 hours'),
  label: z.string().max(100).optional(),
});

export const updateLocationSchema = z.object({
  shareId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
