import { Router, Request, Response } from 'express';
import { users, circles, locationShares } from '../store/db';
import { getAuthUserId } from '../middleware/auth.middleware';
import { sanitizeText } from '../utils/sanitizer';
import { UserProfile } from '../../src/types';

export const usersRouter = Router();

usersRouter.get('/api/users', (_req: Request, res: Response) => {
  res.json(Array.from(users.values()));
});

usersRouter.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

usersRouter.put('/api/auth/me', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { displayName, email, avatarColor } = req.body;
  if (displayName) user.displayName = sanitizeText(displayName)!;
  if (email) user.email = email.trim().toLowerCase();
  if (avatarColor) user.avatarColor = avatarColor;

  for (const circle of circles.values()) {
    for (const member of circle.members) {
      if (member.userId === userId) {
        member.profile = { ...user };
      }
    }
  }

  for (const share of locationShares.values()) {
    if (share.userId === userId) {
      share.userProfile = { ...user };
    }
  }

  res.json(user);
});

usersRouter.post('/api/auth/register', (req: Request, res: Response) => {
  const { displayName, email, avatarColor } = req.body;
  if (!displayName || !email) {
    return res.status(400).json({ error: 'Display name and email are required' });
  }

  const trimmedEmail = email.trim().toLowerCase();

  const existingUser = Array.from(users.values()).find((u) => u.email === trimmedEmail);
  if (existingUser) {
    if (displayName) existingUser.displayName = sanitizeText(displayName)!;
    if (avatarColor) existingUser.avatarColor = avatarColor;

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

usersRouter.delete('/api/user/account', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);

  for (const [id, share] of locationShares.entries()) {
    if (share.userId === userId) locationShares.delete(id);
  }

  for (const circle of circles.values()) {
    circle.members = circle.members.filter((m) => m.userId !== userId);
  }

  users.delete(userId);

  res.json({ success: true, message: 'Account and all associated location history purged' });
});
