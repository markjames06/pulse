import { Router, Request, Response } from 'express';
import { pings, users, circles, notifications } from '../store/db';
import { getAuthUserId } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { sanitizeText } from '../utils/sanitizer';
import { createPingSchema, Ping } from '../../src/types';

export const pingsRouter = Router();

pingsRouter.get('/api/pings', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredPings = pings.filter((p) => {
    if (circleId && p.circleId !== circleId) return false;
    const circle = circles.get(p.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(filteredPings);
});

pingsRouter.post('/api/pings', rateLimiter(10, 60000), (req: Request, res: Response) => {
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
