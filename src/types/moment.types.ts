import { z } from 'zod';
import { UserProfile } from './user.types';

export interface PulseMoment {
  id: string;
  circleId: string;
  createdBy: string;
  title: string;
  place: string;
  startsAt: string;
  createdAt: string;
  creatorProfile?: UserProfile;
}

export const createMomentSchema = z.object({
  circleId: z.string().min(1, 'Invalid circle ID'),
  title: z.string().trim().min(1, 'Add a name for this plan').max(100),
  place: z.string().trim().min(1, 'Add a place to meet').max(160),
  startsAt: z.string().datetime({ local: true }),
});