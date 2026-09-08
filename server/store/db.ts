import {
  UserProfile,
  Circle,
  LocationShare,
  Ping,
  MemoryPin,
  NotificationItem,
  SafetyCheckIn,
  PulseMoment,
  UpgradeInterest,
} from '../../src/types/index.js';

export type PushSubscriptionRecord = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userId: string;
  createdAt: string;
};

type PulseMemoryStore = {
  users: Map<string, UserProfile>;
  circles: Map<string, Circle>;
  locationShares: Map<string, LocationShare>;
  pings: Ping[];
  memoryPins: MemoryPin[];
  notifications: NotificationItem[];
  safetyCheckIns: SafetyCheckIn[];
  moments: PulseMoment[];
  pushSubscriptions: PushSubscriptionRecord[];
  upgradeInterests: UpgradeInterest[];
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
    safetyCheckIns: [],
    moments: [],
    pushSubscriptions: [],
    upgradeInterests: [],
  };
}

export const users = globalStore.__pulseStore.users;
export const circles = globalStore.__pulseStore.circles;
export const locationShares = globalStore.__pulseStore.locationShares;
export const pings = globalStore.__pulseStore.pings;
export const memoryPins = globalStore.__pulseStore.memoryPins;
export const notifications = globalStore.__pulseStore.notifications;
export const safetyCheckIns = globalStore.__pulseStore.safetyCheckIns;
export const moments = globalStore.__pulseStore.moments;
export const pushSubscriptions = globalStore.__pulseStore.pushSubscriptions;
export const upgradeInterests = globalStore.__pulseStore.upgradeInterests;

// Add logging for user store operations
const originalUsersSet = users.set;
users.set = function(key: string, value: UserProfile) {
  console.log('User added to store:', key, 'Email:', value.email);
  return originalUsersSet.call(this, key, value);
};

const originalUsersDelete = users.delete;
users.delete = function(key: string) {
  console.log('User deleted from store:', key);
  return originalUsersDelete.call(this, key);
};

export function seedData() {
  users.clear();
  locationShares.clear();
  pings.length = 0;
  memoryPins.length = 0;
  notifications.length = 0;
  safetyCheckIns.length = 0;
  moments.length = 0;
  pushSubscriptions.length = 0;
  upgradeInterests.length = 0;
  circles.clear();
}
