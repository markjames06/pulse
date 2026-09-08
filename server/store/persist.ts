import {
  users,
  circles,
  locationShares,
  pings,
  memoryPins,
  notifications,
  safetyCheckIns,
  moments,
  pushSubscriptions,
  upgradeInterests,
  deletedEmails,
  PushSubscriptionRecord,
} from './db.js';
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
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ENVIRONMENT = process.env.NODE_ENV || 'development';
const STORE_KEY = `pulse:db:v2`;
const LOCAL_STORE_PATH = path.resolve(process.cwd(), `data/pulse-store.json`);

type StoreSnapshot = {
  users: UserProfile[];
  circles: Circle[];
  locationShares: LocationShare[];
  pings: Ping[];
  memoryPins: MemoryPin[];
  notifications: NotificationItem[];
  safetyCheckIns: SafetyCheckIn[];
  moments: PulseMoment[];
  pushSubscriptions: PushSubscriptionRecord[];
  upgradeInterests: UpgradeInterest[];
  deletedEmails: string[];
};

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn('Redis configuration missing. Data will not persist in production.');
    return null;
  }
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
    safetyCheckIns: [...safetyCheckIns],
    moments: [...moments],
    pushSubscriptions: [...pushSubscriptions],
    upgradeInterests: [...upgradeInterests],
    deletedEmails: Array.from(deletedEmails),
  };
}

function restoreSnapshot(snapshot: StoreSnapshot) {
  users.clear();
  circles.clear();
  locationShares.clear();
  pings.length = 0;
  memoryPins.length = 0;
  notifications.length = 0;
  safetyCheckIns.length = 0;
  moments.length = 0;
  pushSubscriptions.length = 0;
  upgradeInterests.length = 0;
  deletedEmails.clear();

  for (const user of snapshot.users || []) users.set(user.id, user);
  for (const circle of snapshot.circles || []) circles.set(circle.id, circle);
  for (const share of snapshot.locationShares || []) locationShares.set(share.id, share);
  pings.push(...(snapshot.pings || []));
  memoryPins.push(...(snapshot.memoryPins || []));
  notifications.push(...(snapshot.notifications || []));
  safetyCheckIns.push(...(snapshot.safetyCheckIns || []));
  moments.push(...(snapshot.moments || []));
  pushSubscriptions.push(...(snapshot.pushSubscriptions || []));
  upgradeInterests.push(...(snapshot.upgradeInterests || []));
  for (const email of snapshot.deletedEmails || []) deletedEmails.add(email);
}

async function redisCommand(command: unknown[]) {
  const config = redisConfig();
  if (!config) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Redis command failed with HTTP ${response.status}`);
    }

    return response.json() as Promise<{ result: unknown }>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Redis command timed out');
    }
    throw error;
  }
}

let hydratePromise: Promise<void> | null = null;
let persistQueue = Promise.resolve();

export async function hydrateStore() {
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    const config = redisConfig();
    if (!config) {
      console.warn('Redis configuration missing. Using local file storage (data will not persist in production)');
      const snapshot = await readLocalSnapshot();
      if (snapshot) {
        console.log('Restored snapshot from local file');
        restoreSnapshot(snapshot);
      } else {
        console.log('No local snapshot found, starting with empty store');
      }
      return;
    }

    try {
      console.log('Attempting to hydrate from Redis...');
      const payload = await redisCommand(['GET', STORE_KEY]);
      const raw = payload?.result;

      if (typeof raw === 'string' && raw.trim()) {
        restoreSnapshot(JSON.parse(raw) as StoreSnapshot);
        console.log('Successfully restored snapshot from Redis');
        return;
      } else {
        console.log('No data found in Redis, starting with empty store');
      }
    } catch (error) {
      console.error('Failed to hydrate Pulse store from Redis:', error);
      console.error('Falling back to local file storage');
      hydratePromise = null;
      
      // Fallback to local storage
      const snapshot = await readLocalSnapshot();
      if (snapshot) {
        console.log('Restored snapshot from local file as fallback');
        restoreSnapshot(snapshot);
      }
    }
  })();

  return hydratePromise;
}

export async function persistStore() {
  const config = redisConfig();
  if (!config) {
    persistQueue = persistQueue.then(async () => {
      try {
        await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
        await writeFile(LOCAL_STORE_PATH, JSON.stringify(takeSnapshot()), 'utf8');
        console.log('Successfully persisted store to local file');
      } catch (error) {
        console.error('Failed to persist local Pulse store:', error);
      }
    });
    await persistQueue;
    return;
  }

  try {
    await redisCommand(['SET', STORE_KEY, JSON.stringify(takeSnapshot())]);
    console.log('Successfully persisted store to Redis');
  } catch (error) {
    console.error('Failed to persist Pulse store to Redis:', error);
    console.error('Attempting fallback to local file storage');
    
    // Fallback to local storage
    try {
      await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
      await writeFile(LOCAL_STORE_PATH, JSON.stringify(takeSnapshot()), 'utf8');
      console.log('Successfully persisted store to local file as fallback');
    } catch (localError) {
      console.error('Failed to persist to local file as well:', localError);
    }
  }
}
