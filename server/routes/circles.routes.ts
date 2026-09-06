import { Router, Request, Response } from 'express';
import { circles, users, notifications } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { publicUser } from '../utils/publicUser.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeText } from '../utils/sanitizer.js';
import { createCircleSchema, joinCircleSchema, Circle } from '../../src/types/index.js';

export const circlesRouter = Router();

circlesRouter.get('/api/circles', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const userCircles = Array.from(circles.values())
    .filter((circle) => circle.members.some((m) => m.userId === userId))
    .map((circle) => ({
      ...circle,
      members: circle.members.map((member) => ({
        ...member,
        profile: member.profile ? publicUser(member.profile) : undefined,
      })),
    }));
  res.json(userCircles);
});

circlesRouter.post('/api/circles', requireAuth, rateLimiter(5, 3600000), (req: Request, res: Response) => {
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
        profile: publicUser(user),
      },
    ],
  };

  circles.set(circleId, newCircle);
  res.status(201).json(newCircle);
});

circlesRouter.post('/api/circles/join', requireAuth, rateLimiter(10, 600000), (req: Request, res: Response) => {
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

  if (circle.members.length >= 5) {
    return res.status(400).json({
      error: 'This circle has reached its maximum size limit of 5 trusted members.',
    });
  }

  if (circle.members.some((m) => m.userId === userId)) {
    return res.status(400).json({ error: 'You are already a member of this circle.' });
  }

  const newMember = {
    circleId: circle.id,
    userId,
    role: 'member' as const,
    joinedAt: new Date().toISOString(),
    profile: publicUser(user),
  };

  circle.members.push(newMember);

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
