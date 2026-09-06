import { Router, Request, Response } from 'express';
import { notifications, circles } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';

export const notificationsRouter = Router();

notificationsRouter.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredNotifs = notifications.filter((n) => {
    if (circleId && n.circleId !== circleId) return false;
    const circle = circles.get(n.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(filteredNotifs);
});
