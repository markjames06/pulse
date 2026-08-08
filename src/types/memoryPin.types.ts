import { z } from 'zod';
import { UserProfile } from './user.types';

export interface MemoryPin {
  id: string;
  circleId: string;
  createdBy: string;
  latitude: number;
  longitude: number;
  caption: string;
  emoji?: string;
  createdAt: string;
  creatorProfile?: UserProfile;
}

export const createMemoryPinSchema = z.object({
  circleId: z.string().min(1, 'Invalid circle ID'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  caption: z.string().trim().min(1, 'Caption is required').max(280, 'Max 280 characters'),
  emoji: z.string().max(10).optional(),
});
