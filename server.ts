import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  UserProfile,
  Circle,
  LocationShare,
  Ping,
  MemoryPin,
  NotificationItem,
  createCircleSchema,
  joinCircleSchema,
  createShareSchema,
  createPingSchema,
  createMemoryPinSchema,
  updateLocationSchema,
} from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Basic HTML sanitizer for free-text input fields to prevent XSS
function sanitizeText(input?: string): string | undefined {
  if (!input) return undefined;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Simple In-Memory Store
const users: Map<string, UserProfile> = new Map();
const circles: Map<string, Circle> = new Map(); // circleId -> Circle
const locationShares: Map<string, LocationShare> = new Map(); // shareId -> LocationShare
const pings: Ping[] = [];
const memoryPins: MemoryPin[] = [];
const notifications: NotificationItem[] = [];

// Simple Rate Limiter Map (ip -> { timestamp, count })
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}_${req.baseUrl}${req.path}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    record.count += 1;
    next();
  };
}

// Seed initial default data
function seedData() {
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

// Scheduled cleanup for expired location shares older than 24 hours
setInterval(() => {
  const now = new Date().getTime();
  const cutoff = now - 24 * 60 * 60 * 1000;

  for (const [id, share] of locationShares.entries()) {
    const expireTime = new Date(share.expiresAt).getTime();
    if (expireTime < cutoff) {
      locationShares.delete(id);
    }
  }
}, 60 * 1000); // Check every 60 seconds

// Helper to get active user ID from headers (or default to first active user)
function getAuthUserId(req: Request): string {
  const authHeader = req.headers['x-user-id'] as string;
  if (authHeader && users.has(authHeader)) {
    return authHeader;
  }
  const allUsers = Array.from(users.values());
  if (allUsers.length > 0) {
    return allUsers[0].id;
  }
  return '';
}

// API Routes

// User profiles
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(Array.from(users.values()));
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/auth/me', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { displayName, email, avatarColor } = req.body;
  if (displayName) user.displayName = sanitizeText(displayName)!;
  if (email) user.email = email.trim().toLowerCase();
  if (avatarColor) user.avatarColor = avatarColor;

  // Sync profile inside all circle memberships
  for (const circle of circles.values()) {
    for (const member of circle.members) {
      if (member.userId === userId) {
        member.profile = { ...user };
      }
    }
  }

  // Sync profile inside location shares
  for (const share of locationShares.values()) {
    if (share.userId === userId) {
      share.userProfile = { ...user };
    }
  }

  res.json(user);
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { displayName, email, avatarColor } = req.body;
  if (!displayName || !email) {
    return res.status(400).json({ error: 'Display name and email are required' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  // If email already registered, return existing account or update info
  const existingUser = Array.from(users.values()).find((u) => u.email === trimmedEmail);
  if (existingUser) {
    if (displayName) existingUser.displayName = sanitizeText(displayName)!;
    if (avatarColor) existingUser.avatarColor = avatarColor;

    // Ensure member in all circles
    for (const circle of circles.values()) {
      if (!circle.members.some((m) => m.userId === existingUser.id)) {
        circle.members.push({
          circleId: circle.id,
          userId: existingUser.id,
          role: 'member',
          joinedAt: new Date().toISOString(),
          profile: existingUser,
        });
      }
    }

    return res.json(existingUser);
  }

  const sanitizedName = sanitizeText(displayName)!;
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newUser: UserProfile = {
    id: newId,
    displayName: sanitizedName,
    email: trimmedEmail,
    avatarColor: avatarColor || 'bg-indigo-600',
    createdAt: new Date().toISOString(),
  };

  users.set(newId, newUser);

  // Automatically add user to all existing circles so they are immediately visible on maps
  for (const circle of circles.values()) {
    circle.members.push({
      circleId: circle.id,
      userId: newId,
      role: 'member',
      joinedAt: new Date().toISOString(),
      profile: newUser,
    });
  }

  res.status(201).json(newUser);
});

// Circles
app.get('/api/circles', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const userCircles = Array.from(circles.values()).filter((circle) =>
    circle.members.some((m) => m.userId === userId)
  );
  res.json(userCircles);
});

app.post('/api/circles', rateLimiter(5, 3600000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = createCircleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const name = sanitizeText(parseResult.data.name)!;
  const circleId = `circ_${Date.now()}`;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const newCircle: Circle = {
    id: circleId,
    name,
    ownerId: userId,
    inviteCode,
    createdAt: new Date().toISOString(),
    members: [
      {
        circleId,
        userId,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        profile: user,
      },
    ],
  };

  circles.set(circleId, newCircle);
  res.status(201).json(newCircle);
});

app.post('/api/circles/join', rateLimiter(10, 600000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = joinCircleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const code = parseResult.data.inviteCode.toUpperCase();
  const circle = Array.from(circles.values()).find((c) => c.inviteCode === code);

  if (!circle) {
    return res.status(404).json({ error: 'Invalid invite code. Circle not found.' });
  }

  // Check max 5 members constraint
  if (circle.members.length >= 5) {
    return res.status(400).json({
      error: 'This circle has reached its maximum size limit of 5 trusted members.',
    });
  }

  // Check if already a member
  if (circle.members.some((m) => m.userId === userId)) {
    return res.status(400).json({ error: 'You are already a member of this circle.' });
  }

  const newMember = {
    circleId: circle.id,
    userId,
    role: 'member' as const,
    joinedAt: new Date().toISOString(),
    profile: user,
  };

  circle.members.push(newMember);

  // Push Notification
  notifications.unshift({
    id: `notif_${Date.now()}`,
    circleId: circle.id,
    type: 'member_joined',
    title: 'New Member Joined!',
    body: `${user.displayName} joined ${circle.name}`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  res.json(circle);
});

// Location Shares
app.get('/api/shares', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const now = new Date();
  const activeShares = Array.from(locationShares.values()).filter((share) => {
    const isExpired = new Date(share.expiresAt) <= now;
    if (isExpired) share.isActive = false;

    if (!share.isActive) return false;
    if (circleId && share.circleId !== circleId) return false;

    // Check user circle membership
    const circle = circles.get(share.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(activeShares);
});

app.post('/api/shares', rateLimiter(20, 60000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = createShareSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const { circleId, latitude, longitude, durationMinutes, label } = parseResult.data;

  const circle = circles.get(circleId);
  if (!circle || !circle.members.some((m) => m.userId === userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  // Deactivate any existing active share for this user in this circle
  for (const [id, s] of locationShares.entries()) {
    if (s.userId === userId && s.circleId === circleId) {
      s.isActive = false;
    }
  }

  const sanitizedLabel = sanitizeText(label);
  const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();
  const shareId = `share_${Date.now()}`;

  const newShare: LocationShare = {
    id: shareId,
    userId,
    circleId,
    latitude,
    longitude,
    label: sanitizedLabel,
    expiresAt,
    createdAt: new Date().toISOString(),
    isActive: true,
    userProfile: user,
  };

  locationShares.set(shareId, newShare);

  notifications.unshift({
    id: `notif_${Date.now()}`,
    circleId,
    type: 'share_started',
    title: `${user.displayName} started sharing location`,
    body: `${sanitizedLabel ? sanitizedLabel + ' • ' : ''}${durationMinutes} min timer`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  res.status(201).json(newShare);
});

app.delete('/api/shares/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const shareId = req.params.id;

  const share = locationShares.get(shareId);
  if (!share) return res.status(404).json({ error: 'Share not found' });

  if (share.userId !== userId) {
    return res.status(403).json({ error: 'You can only stop your own location shares' });
  }

  share.isActive = false;
  locationShares.delete(shareId);

  res.json({ success: true, message: 'Location sharing stopped successfully' });
});

app.put('/api/shares/:id/location', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const shareId = req.params.id;

  const parseResult = updateLocationSchema.safeParse({ shareId, ...req.body });
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const share = locationShares.get(shareId);
  if (!share || !share.isActive) {
    return res.status(404).json({ error: 'Active location share not found' });
  }

  if (share.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  share.latitude = parseResult.data.latitude;
  share.longitude = parseResult.data.longitude;

  res.json(share);
});

// Pings
app.get('/api/pings', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredPings = pings.filter((p) => {
    if (circleId && p.circleId !== circleId) return false;
    const circle = circles.get(p.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(filteredPings);
});

app.post('/api/pings', rateLimiter(10, 60000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = createPingSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const { circleId, message, latitude, longitude } = parseResult.data;
  const circle = circles.get(circleId);
  if (!circle || !circle.members.some((m) => m.userId === userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  const sanitizedMessage = sanitizeText(message)!;
  const newPing: Ping = {
    id: `ping_${Date.now()}`,
    senderId: userId,
    circleId,
    latitude,
    longitude,
    message: sanitizedMessage,
    createdAt: new Date().toISOString(),
    senderProfile: user,
  };

  pings.unshift(newPing);

  notifications.unshift({
    id: `notif_${Date.now()}`,
    circleId,
    type: 'ping_received',
    title: `Ping from ${user.displayName}`,
    body: sanitizedMessage,
    createdAt: new Date().toISOString(),
    read: false,
  });

  res.status(201).json(newPing);
});

// Memory Pins
app.get('/api/memory-pins', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredPins = memoryPins.filter((pin) => {
    if (circleId && pin.circleId !== circleId) return false;
    const circle = circles.get(pin.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(filteredPins);
});

app.post('/api/memory-pins', rateLimiter(10, 60000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = createMemoryPinSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const { circleId, latitude, longitude, caption, emoji } = parseResult.data;
  const circle = circles.get(circleId);
  if (!circle || !circle.members.some((m) => m.userId === userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  const sanitizedCaption = sanitizeText(caption)!;
  const newPin: MemoryPin = {
    id: `mem_${Date.now()}`,
    circleId,
    createdBy: userId,
    latitude,
    longitude,
    caption: sanitizedCaption,
    emoji: emoji || '📍',
    createdAt: new Date().toISOString(),
    creatorProfile: user,
  };

  memoryPins.unshift(newPin);

  notifications.unshift({
    id: `notif_${Date.now()}`,
    circleId,
    type: 'memory_pin_added',
    title: `New Memory Pin Saved`,
    body: `${user.displayName}: ${sanitizedCaption}`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  res.status(201).json(newPin);
});

app.delete('/api/memory-pins/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const pinId = req.params.id;

  const index = memoryPins.findIndex((p) => p.id === pinId);
  if (index === -1) return res.status(404).json({ error: 'Pin not found' });

  const pin = memoryPins[index];
  if (pin.createdBy !== userId) {
    return res.status(403).json({ error: 'You can only delete your own memory pins' });
  }

  memoryPins.splice(index, 1);
  res.json({ success: true });
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredNotifs = notifications.filter((n) => {
    if (circleId && n.circleId !== circleId) return false;
    const circle = circles.get(n.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(filteredNotifs);
});

// Account / Data Purge Request
app.delete('/api/user/account', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);

  // Purge user shares
  for (const [id, share] of locationShares.entries()) {
    if (share.userId === userId) locationShares.delete(id);
  }

  // Remove from circles
  for (const circle of circles.values()) {
    circle.members = circle.members.filter((m) => m.userId !== userId);
  }

  // Remove user
  users.delete(userId);

  res.json({ success: true, message: 'Account and all associated location history purged' });
});

// Catch-all for unknown API endpoints to prevent Vite SPA HTML fallback on /api requests
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global Express Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse server running on http://localhost:${PORT}`);
  });
}

startServer();
