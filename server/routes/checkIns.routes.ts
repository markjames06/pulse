import { Router, Request, Response } from 'express';
import { circles, notifications, safetyCheckIns, users } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { createSafetyCheckInSchema, SafetyCheckIn } from '../../src/types/index.js';
import { publicUser } from '../utils/publicUser.js';
import { publishCircleEvent } from '../store/events.js';

export const checkInsRouter = Router();

function isCircleMember(circleId: string, userId: string) {
  return circles.get(circleId)?.members.some((member) => member.userId === userId) === true;
}

function expireCheckIns() {
  for (const checkIn of safetyCheckIns) {
    if (checkIn.status !== 'active' || new Date(checkIn.expiresAt).getTime() > Date.now()) continue;
    checkIn.status = 'missed';
    const user = users.get(checkIn.userId);
    if (!user) continue;
    const notification = {
      id: `notif_checkin_${checkIn.id}`,
      circleId: checkIn.circleId,
      type: 'check_in_missed' as const,
      title: `${user.displayName} missed a safety check-in`,
      body: `${user.displayName} did not confirm they were safe before the timer ended.`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    if (!notifications.some((item) => item.id === notification.id)) {
      notifications.unshift(notification);
      publishCircleEvent(checkIn.circleId, { checkIn, notification });
    }
  }
}

checkInsRouter.get('/api/check-ins', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;
  expireCheckIns();
  if (!circleId || !isCircleMember(circleId, userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  res.json(safetyCheckIns.filter((checkIn) => checkIn.circleId === circleId).slice(0, 20));
});

checkInsRouter.post('/api/check-ins', requireAuth, rateLimiter(10, 60000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  const parsed = createSafetyCheckInSchema.safeParse(req.body);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (!isCircleMember(parsed.data.circleId, userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  for (const checkIn of safetyCheckIns) {
    if (checkIn.userId === userId && checkIn.circleId === parsed.data.circleId && checkIn.status === 'active') {
      checkIn.status = 'completed';
      checkIn.completedAt = new Date().toISOString();
    }
  }

  const now = new Date();
  const checkIn: SafetyCheckIn = {
    id: `checkin_${Date.now()}`,
    circleId: parsed.data.circleId,
    userId,
    status: 'active',
    expiresAt: new Date(now.getTime() + parsed.data.durationMinutes * 60000).toISOString(),
    createdAt: now.toISOString(),
    userProfile: publicUser(user),
  };
  safetyCheckIns.unshift(checkIn);
  publishCircleEvent(checkIn.circleId, { checkIn });
  res.status(201).json(checkIn);
});

checkInsRouter.post('/api/check-ins/:id/complete', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const checkIn = safetyCheckIns.find((item) => item.id === req.params.id);
  if (!checkIn) return res.status(404).json({ error: 'Safety check-in not found' });
  if (checkIn.userId !== userId) return res.status(403).json({ error: 'You can only complete your own check-in' });
  if (checkIn.status !== 'active') return res.status(400).json({ error: 'This check-in is no longer active' });

  checkIn.status = 'completed';
  checkIn.completedAt = new Date().toISOString();
  publishCircleEvent(checkIn.circleId, { checkIn });
  res.json(checkIn);
});
