import { Router, Request, Response } from 'express';
import { locationShares, users, circles, notifications } from '../store/db';
import { getAuthUserId } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { sanitizeText } from '../utils/sanitizer';
import { createShareSchema, updateLocationSchema, LocationShare } from '../../src/types';

export const sharesRouter = Router();

sharesRouter.get('/api/shares', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;

  const now = new Date();
  const activeShares = Array.from(locationShares.values()).filter((share) => {
    const isExpired = new Date(share.expiresAt) <= now;
    if (isExpired) share.isActive = false;

    if (!share.isActive) return false;
    if (circleId && share.circleId !== circleId) return false;

    const circle = circles.get(share.circleId);
    return circle?.members.some((m) => m.userId === userId);
  });

  res.json(activeShares);
});

sharesRouter.post('/api/shares', rateLimiter(20, 60000), (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = createShareSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const { circleId, latitude, longitude, durationMinutes, label } = parseResult.data;

  const circle = circles.get(circleId);
  if (!circle || !circle.members.some((m) => m.userId === userId)) {
    return res.status(403).json({ error: 'You are not a member of this circle' });
  }

  for (const [id, s] of locationShares.entries()) {
    if (s.userId === userId && s.circleId === circleId) {
      s.isActive = false;
    }
  }

  const sanitizedLabel = sanitizeText(label);
  const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();
  const shareId = `share_${Date.now()}`;

  const newShare: LocationShare = {
    id: shareId,
    userId,
    circleId,
    latitude,
    longitude,
    label: sanitizedLabel,
    expiresAt,
    createdAt: new Date().toISOString(),
    isActive: true,
    userProfile: user,
  };

  locationShares.set(shareId, newShare);

  notifications.unshift({
    id: `notif_${Date.now()}`,
    circleId,
    type: 'share_started',
    title: `${user.displayName} started sharing location`,
    body: `${sanitizedLabel ? sanitizedLabel + ' • ' : ''}${durationMinutes} min timer`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  res.status(201).json(newShare);
});

sharesRouter.delete('/api/shares/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const shareId = req.params.id;

  const share = locationShares.get(shareId);
  if (!share) return res.status(404).json({ error: 'Share not found' });

  if (share.userId !== userId) {
    return res.status(403).json({ error: 'You can only stop your own location shares' });
  }

  share.isActive = false;
  locationShares.delete(shareId);

  res.json({ success: true, message: 'Location sharing stopped successfully' });
});

sharesRouter.put('/api/shares/:id/location', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const shareId = req.params.id;

  const parseResult = updateLocationSchema.safeParse({ shareId, ...req.body });
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  const share = locationShares.get(shareId);
  if (!share || !share.isActive) {
    return res.status(404).json({ error: 'Active location share not found' });
  }

  if (share.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  share.latitude = parseResult.data.latitude;
  share.longitude = parseResult.data.longitude;

  res.json(share);
});
