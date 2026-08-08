import {
  UserProfile,
  Circle,
  LocationShare,
  Ping,
  MemoryPin,
  NotificationItem,
} from '../../src/types';

export const users: Map<string, UserProfile> = new Map();

export const circles: Map<string, Circle> = new Map();

export const locationShares: Map<string, LocationShare> = new Map();

export const pings: Ping[] = [];

export const memoryPins: MemoryPin[] = [];

export const notifications: NotificationItem[] = [];

export function seedData() {
  users.clear();
  locationShares.clear();
  pings.length = 0;
  memoryPins.length = 0;
  notifications.length = 0;
  circles.clear();

  const defaultUser: UserProfile = {
    id: 'usr_default',
    displayName: 'Pulse User',
    email: 'pulse@example.com',
    avatarColor: 'bg-indigo-600',
    createdAt: new Date().toISOString(),
  };

  users.set(defaultUser.id, defaultUser);

  const familyCircle: Circle = {
    id: 'circ_family',
    name: 'Our Circle ❤️',
    ownerId: defaultUser.id,
    inviteCode: 'PULSE7',
    createdAt: new Date().toISOString(),
    members: [
      {
        circleId: 'circ_family',
        userId: defaultUser.id,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        profile: defaultUser,
      },
    ],
  };

  circles.set(familyCircle.id, familyCircle);
}

seedData();