import { z } from 'zod';
import { UserProfile } from './user.types';

export interface Ping {
  id: string;
  senderId: string;
  circleId: string;
  latitude?: number;
  longitude?: number;
  message: string;
  createdAt: string;
  senderProfile?: UserProfile;
}

export const createPingSchema = z.object({
  circleId: z.string().min(1, 'Invalid circle ID'),
  message: z.string().trim().min(1, 'Message is required').max(280, 'Max 280 characters'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
