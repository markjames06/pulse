import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { users, circles, locationShares, pings, memoryPins, notifications, deletedEmails } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeText } from '../utils/sanitizer.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { publicUser, safeAvatarColor } from '../utils/publicUser.js';
import { clearSessionCookie, setSessionCookie, getTokenFromRequest } from '../middleware/session.js';
import { persistStore } from '../store/persist.js';
import { Circle, UserProfile } from '../../src/types/index.js';

export const usersRouter = Router();

// Debug endpoint to check session and Redis status
usersRouter.get('/api/debug/session', (req: Request, res: Response) => {
  const token = getTokenFromRequest(req);
  const userId = getAuthUserId(req);
  
  res.json({
    environment: process.env.NODE_ENV,
    isVercel: Boolean(process.env.VERCEL),
    hasToken: !!token,
    tokenLength: token?.length,
    userId,
    userExists: userId ? users.has(userId) : false,
    totalUsers: users.size,
    redisConfigured: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    sessionSecretConfigured: !!process.env.SESSION_SECRET,
    cookieHeader: req.headers.cookie ? 'present' : 'missing',
    cookiePreview: req.headers.cookie ? req.headers.cookie.substring(0, 100) : 'none'
  });
});

// Emergency endpoint to reset all users (for testing purposes only)
// This should be removed or protected in production
usersRouter.post('/api/reset-all-users', (req: Request, res: Response) => {
  console.log('!!! RESET ALL USERS REQUESTED !!!');
  users.clear();
  circles.clear();
  locationShares.clear();
  pings.length = 0;
  memoryPins.length = 0;
  notifications.length = 0;
  
  // Clear persistence
  persistStore();
  
  console.log('All users and data have been reset');
  res.json({ success: true, message: 'All users and data have been reset' });
});

const registerSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(72),
  avatarColor: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(72),
});

const updateAccountSchema = z
  .object({
    displayName: z.string().trim().min(2).max(50).optional(),
    email: z.string().trim().email().max(120).optional(),
    avatarColor: z.string().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Provide at least one account detail to update',
  });

function createPersonalCircle(user: UserProfile): Circle {
  const circleId = `circ_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const circle: Circle = {
    id: circleId,
    name: `${user.displayName.split(' ')[0]}'s Circle`,
    ownerId: user.id,
    inviteCode,
    createdAt: new Date().toISOString(),
    members: [
      {
        circleId,
        userId: user.id,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        profile: publicUser(user),
      },
    ],
  };

  circles.set(circleId, circle);
  return circle;
}

usersRouter.post(
  '/api/auth/register',
  rateLimiter(8, 15 * 60 * 1000),
  async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log('Registration validation failed:', parsed.error.issues[0].message);
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const email = parsed.data.email.toLowerCase();
    console.log('Registration attempt for email:', email);
    console.log('Current users in store:', users.size);
    
    const existingUser = Array.from(users.values()).find((user) => user.email === email);
    if (existingUser) {
      console.log('Registration failed: Email already exists:', email);
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Check if this email was previously deleted
    const wasPreviouslyDeleted = deletedEmails.has(email);
    console.log('Email was previously deleted:', wasPreviouslyDeleted);

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: UserProfile = {
      id: newId,
      displayName: sanitizeText(parsed.data.displayName)!,
      email,
      avatarColor: safeAvatarColor(parsed.data.avatarColor),
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(parsed.data.password),
    };

    console.log('Creating new user:', newId);
    users.set(newId, newUser);
    createPersonalCircle(newUser);
    
    // Remove from deleted emails set since they're re-registering
    if (wasPreviouslyDeleted) {
      deletedEmails.delete(email);
      console.log('Removed email from deleted emails set:', email);
    }
    
    await persistStore();
    setSessionCookie(res, newId);

    console.log('Registration successful for user:', newId);
    res.status(201).json({
      ...publicUser(newUser),
      showTutorial: wasPreviouslyDeleted,
    });
  }
);

usersRouter.post(
  '/api/auth/login',
  rateLimiter(10, 15 * 60 * 1000),
  async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log('Login validation failed:', parsed.error.issues[0].message);
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const email = parsed.data.email.toLowerCase();
    console.log('Login attempt for email:', email);
    console.log('Current users in store:', users.size);
    
    const existingUser = Array.from(users.values()).find((user) => user.email === email);
    
    if (!existingUser) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('User found:', existingUser.id, 'checking password...');
    const passwordOk = await verifyPassword(parsed.data.password, existingUser?.passwordHash);
    
    if (!passwordOk) {
      console.log('Login failed: Invalid password for user:', existingUser.id);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Login successful for user:', existingUser.id);
    setSessionCookie(res, existingUser.id);
    res.json(publicUser(existingUser));
  }
);

usersRouter.get('/api/auth/session', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = userId ? users.get(userId) : undefined;
  res.json(user ? publicUser(user) : null);
});

usersRouter.post('/api/auth/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

usersRouter.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = users.get(getAuthUserId(req));
  if (!user) return res.status(401).json({ error: 'Please sign in to continue' });
  res.json(publicUser(user));
});

usersRouter.put('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'Please sign in to continue' });

  const parsed = updateAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { displayName, email, avatarColor } = parsed.data;
  if (displayName !== undefined) user.displayName = sanitizeText(displayName)!;
  if (email !== undefined) {
    const nextEmail = email.toLowerCase();
    const taken = Array.from(users.values()).some(
      (candidate) => candidate.email === nextEmail && candidate.id !== userId
    );
    if (taken) {
      return res.status(409).json({ error: 'That email is already in use' });
    }
    user.email = nextEmail;
  }
  if (avatarColor !== undefined) user.avatarColor = safeAvatarColor(avatarColor);

  const safe = publicUser(user);

  for (const circle of circles.values()) {
    for (const member of circle.members) {
      if (member.userId === userId) {
        member.profile = safe;
      }
    }
  }

  for (const share of locationShares.values()) {
    if (share.userId === userId) {
      share.userProfile = safe;
    }
  }

  res.json(safe);
});

usersRouter.delete('/api/user/account', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  
  if (user) {
    // Add email to deleted emails set for tutorial tracking
    deletedEmails.add(user.email);
    console.log('Added email to deleted emails set:', user.email);
  }

  for (const [id, share] of locationShares.entries()) {
    if (share.userId === userId) locationShares.delete(id);
  }

  for (const [circleId, circle] of circles.entries()) {
    circle.members = circle.members.filter((member) => member.userId !== userId);
    if (circle.members.length === 0) {
      circles.delete(circleId);
    }
  }

  for (let index = pings.length - 1; index >= 0; index -= 1) {
    if (pings[index].senderId === userId) pings.splice(index, 1);
  }

  for (let index = memoryPins.length - 1; index >= 0; index -= 1) {
    if (memoryPins[index].createdBy === userId) memoryPins.splice(index, 1);
  }

  for (let index = notifications.length - 1; index >= 0; index -= 1) {
    if (notifications[index].body.includes(userId)) notifications.splice(index, 1);
  }

  users.delete(userId);
  clearSessionCookie(res);

  res.json({ success: true, message: 'Account and all associated location history purged' });
});
