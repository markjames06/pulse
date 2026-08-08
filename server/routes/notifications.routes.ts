import { Router, Request, Response } from 'express';
import { notifications, circles } from '../store/db';
import { getAuthUserId } from '../middleware/auth.middleware';

export const notificationsRouter = Router();

notificationsRouter.get('/api/notifications', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const filteredNotifs = notifications.filter((n) => {
    if (circleId && n.circleId !== circleId) return false;
    const circle = circles.get(n.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(filteredNotifs);
});
