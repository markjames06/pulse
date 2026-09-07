import { Router, Request, Response } from 'express';
import { circles, moments, notifications, users } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { createMomentSchema, PulseMoment } from '../../src/types/index.js';
import { publicUser } from '../utils/publicUser.js';
import { sanitizeText } from '../utils/sanitizer.js';
import { publishCircleEvent } from '../store/events.js';

export const momentsRouter = Router();

function isMember(circleId: string, userId: string) {
  return circles.get(circleId)?.members.some((member) => member.userId === userId) === true;
}

momentsRouter.get('/api/moments', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;
  if (!circleId || !isMember(circleId, userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  res.json(moments.filter((moment) => moment.circleId === circleId).slice(0, 30));
});

momentsRouter.post('/api/moments', requireAuth, rateLimiter(10, 60000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  const parsed = createMomentSchema.safeParse(req.body);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (!isMember(parsed.data.circleId, userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }
  if (Number.isNaN(new Date(parsed.data.startsAt).getTime())) {
    return res.status(400).json({ error: 'Choose a valid date and time' });
  }

  const now = new Date().toISOString();
  const moment: PulseMoment = {
    id: `moment_${Date.now()}`,
    circleId: parsed.data.circleId,
    createdBy: userId,
    title: sanitizeText(parsed.data.title)!,
    place: sanitizeText(parsed.data.place)!,
    startsAt: new Date(parsed.data.startsAt).toISOString(),
    createdAt: now,
    creatorProfile: publicUser(user),
  };
  moments.unshift(moment);

  const notification = {
    id: `notif_${moment.id}`,
    circleId: moment.circleId,
    type: 'moment_created' as const,
    title: `${user.displayName} planned a Pulse Moment`,
    body: `${moment.title} at ${moment.place}`,
    createdAt: now,
    read: false,
  };
  notifications.unshift(notification);
  publishCircleEvent(moment.circleId, { moment, notification });
  res.status(201).json(moment);
});
