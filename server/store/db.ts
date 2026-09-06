import {
  UserProfile,
  Circle,
  LocationShare,
  Ping,
  MemoryPin,
  NotificationItem,
} from '../../src/types';

type PulseMemoryStore = {
  users: Map<string, UserProfile>;
  circles: Map<string, Circle>;
  locationShares: Map<string, LocationShare>;
  pings: Ping[];
  memoryPins: MemoryPin[];
  notifications: NotificationItem[];
  seeded: boolean;
};

const globalStore = globalThis as typeof globalThis & {
  __pulseStore?: PulseMemoryStore;
};

if (!globalStore.__pulseStore) {
  globalStore.__pulseStore = {
    users: new Map(),
    circles: new Map(),
    locationShares: new Map(),
    pings: [],
    memoryPins: [],
    notifications: [],
    seeded: false,
  };
}

export const users = globalStore.__pulseStore.users;
export const circles = globalStore.__pulseStore.circles;
export const locationShares = globalStore.__pulseStore.locationShares;
export const pings = globalStore.__pulseStore.pings;
export const memoryPins = globalStore.__pulseStore.memoryPins;
export const notifications = globalStore.__pulseStore.notifications;

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
  globalStore.__pulseStore!.seeded = true;
}

if (!globalStore.__pulseStore.seeded || users.size === 0) {
  seedData();
}
