import { Router, Request, Response } from 'express';
import { notifications, circles } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { circleEvents } from '../store/events.js';

export const notificationsRouter = Router();

notificationsRouter.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredNotifs = notifications.filter((n) => {
    if (circleId && n.circleId !== circleId) return false;
    const circle = circles.get(n.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(
    filteredNotifs.map((notification) => ({
      ...notification,
      read: notification.read || notification.readBy?.includes(userId) === true,
    }))
  );
});

notificationsRouter.get('/api/events', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;
  const circle = circles.get(circleId);

  if (!circleId || !circle?.members.some((member) => member.userId === userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(': connected\n\n');

  const sendEvent = (event: unknown) => res.write(`data: ${JSON.stringify(event)}\n\n`);
  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000);
  circleEvents.on(circleId, sendEvent);

  req.on('close', () => {
    clearInterval(heartbeat);
    circleEvents.off(circleId, sendEvent);
  });
});

notificationsRouter.post('/api/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.body?.circleId as string;
  let updated = 0;

  for (const notification of notifications) {
    const circle = circles.get(notification.circleId);
    if (
      (!circleId || notification.circleId === circleId) &&
      circle?.members.some((member) => member.userId === userId) &&
      !notification.read
    ) {
      notification.readBy = Array.from(new Set([...(notification.readBy || []), userId]));
      updated += 1;
    }
  }

  res.json({ updated });
});
