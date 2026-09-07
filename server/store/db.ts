import {
  UserProfile,
  Circle,
  LocationShare,
  Ping,
  MemoryPin,
  NotificationItem,
  SafetyCheckIn,
  PulseMoment,
} from '../../src/types/index.js';

type PulseMemoryStore = {
  users: Map<string, UserProfile>;
  circles: Map<string, Circle>;
  locationShares: Map<string, LocationShare>;
  pings: Ping[];
  memoryPins: MemoryPin[];
  notifications: NotificationItem[];
  safetyCheckIns: SafetyCheckIn[];
  moments: PulseMoment[];
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

export function seedData() {
  users.clear();
  locationShares.clear();
  pings.length = 0;
  memoryPins.length = 0;
  notifications.length = 0;
  safetyCheckIns.length = 0;
  moments.length = 0;
  circles.clear();
}
