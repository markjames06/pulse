import {
  users,
  circles,
  locationShares,
  pings,
  memoryPins,
  notifications,
} from './db.js';
import {
  UserProfile,
  Circle,
  LocationShare,
  Ping,
  MemoryPin,
  NotificationItem,
} from '../../src/types/index.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const STORE_KEY = 'pulse:db:v2';
const LOCAL_STORE_PATH = path.resolve(process.cwd(), 'data/pulse-store.json');

type StoreSnapshot = {
  users: UserProfile[];
  circles: Circle[];
  locationShares: LocationShare[];
  pings: Ping[];
  memoryPins: MemoryPin[];
  notifications: NotificationItem[];
};

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function readLocalSnapshot(): Promise<StoreSnapshot | null> {
  try {
    const raw = await readFile(LOCAL_STORE_PATH, 'utf8');
    return JSON.parse(raw) as StoreSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to read local Pulse store:', error);
    }
    return null;
  }
}

function takeSnapshot(): StoreSnapshot {
  return {
    users: Array.from(users.values()),
    circles: Array.from(circles.values()),
    locationShares: Array.from(locationShares.values()),
    pings: [...pings],
    memoryPins: [...memoryPins],
    notifications: [...notifications],
  };
}

function restoreSnapshot(snapshot: StoreSnapshot) {
  users.clear();
  circles.clear();
  locationShares.clear();
  pings.length = 0;
  memoryPins.length = 0;
  notifications.length = 0;

  for (const user of snapshot.users || []) users.set(user.id, user);
  for (const circle of snapshot.circles || []) circles.set(circle.id, circle);
  for (const share of snapshot.locationShares || []) locationShares.set(share.id, share);
  pings.push(...(snapshot.pings || []));
  memoryPins.push(...(snapshot.memoryPins || []));
  notifications.push(...(snapshot.notifications || []));
}

async function redisCommand(command: unknown[]) {
  const config = redisConfig();
  if (!config) return null;

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Redis command failed with HTTP ${response.status}`);
  }

  return response.json() as Promise<{ result: unknown }>;
}

let hydratePromise: Promise<void> | null = null;
let persistQueue = Promise.resolve();

export async function hydrateStore() {
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    if (!redisConfig()) {
      const snapshot = await readLocalSnapshot();
      if (snapshot) restoreSnapshot(snapshot);
      return;
    }

    try {
      const payload = await redisCommand(['GET', STORE_KEY]);
      const raw = payload?.result;

      if (typeof raw === 'string' && raw.trim()) {
        restoreSnapshot(JSON.parse(raw) as StoreSnapshot);
        return;
      }
    } catch (error) {
      console.error('Failed to hydrate Pulse store from Redis:', error);
      hydratePromise = null;
    }
  })();

  return hydratePromise;
}

export async function persistStore() {
  if (!redisConfig()) {
    persistQueue = persistQueue.then(async () => {
      try {
        await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
        await writeFile(LOCAL_STORE_PATH, JSON.stringify(takeSnapshot()), 'utf8');
      } catch (error) {
        console.error('Failed to persist local Pulse store:', error);
      }
    });
    await persistQueue;
    return;
  }

  try {
    await redisCommand(['SET', STORE_KEY, JSON.stringify(takeSnapshot())]);
  } catch (error) {
    console.error('Failed to persist Pulse store to Redis:', error);
  }
}
