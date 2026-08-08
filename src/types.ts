import { z } from 'zod';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  avatarColor: string;
  createdAt: string;
}

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

export interface NotificationItem {
  id: string;
  circleId: string;
  type: 'share_started' | 'share_stopped' | 'ping_received' | 'memory_pin_added' | 'member_joined';
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  data?: any;
}

// Validation Schemas
export const createCircleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Max 50 characters'),
});

export const joinCircleSchema = z.object({
  inviteCode: z.string().trim().min(4, 'Invalid invite code').max(20),
});

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

export const createPingSchema = z.object({
  circleId: z.string().min(1, 'Invalid circle ID'),
  message: z.string().trim().min(1, 'Message is required').max(280, 'Max 280 characters'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const createMemoryPinSchema = z.object({
  circleId: z.string().min(1, 'Invalid circle ID'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  caption: z.string().trim().min(1, 'Caption is required').max(280, 'Max 280 characters'),
  emoji: z.string().max(10).optional(),
});
