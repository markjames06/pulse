import { Router, Request, Response } from 'express';
import { memoryPins, users, circles, notifications } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeText } from '../utils/sanitizer.js';
import { publicUser } from '../utils/publicUser.js';
import { createMemoryPinSchema, MemoryPin } from '../../src/types/index.js';

export const memoryPinsRouter = Router();

memoryPinsRouter.get('/api/memory-pins', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredPins = memoryPins.filter((pin) => {
    if (circleId && pin.circleId !== circleId) return false;
    const circle = circles.get(pin.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(filteredPins);
});

memoryPinsRouter.post('/api/memory-pins', requireAuth, rateLimiter(10, 60000), (req: Request, res: Response) => {
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
    creatorProfile: publicUser(user),
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

memoryPinsRouter.delete('/api/memory-pins/:id', requireAuth, (req: Request, res: Response) => {
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
