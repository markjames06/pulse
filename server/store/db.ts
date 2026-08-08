import { UserProfile, Circle, LocationShare, Ping, MemoryPin, NotificationItem } from '../../src/types';

export const users: Map<string, UserProfile> = new Map();
export const circles: Map<string, Circle> = new Map(); // circleId -> Circle
export const locationShares: Map<string, LocationShare> = new Map(); // shareId -> LocationShare
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

  const familyCircle: Circle = {
    id: 'circ_family',
    name: 'Our Circle ❤️',
    ownerId: 'usr_default',
    inviteCode: 'PULSE7',
    createdAt: new Date().toISOString(),
    members: [],
  };

  circles.set(familyCircle.id, familyCircle);
}

seedData();
