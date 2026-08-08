import { z } from 'zod';
import { UserProfile } from './user.types';

export interface Circle {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  createdAt: string;
  members: CircleMember[];
}

export interface CircleMember {
  circleId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: string;
  profile?: UserProfile;
}

export const createCircleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Max 50 characters'),
});

export const joinCircleSchema = z.object({
  inviteCode: z.string().trim().min(4, 'Invalid invite code').max(20),
});
