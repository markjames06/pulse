import { Router, Request, Response } from 'express';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { pushSubscriptions } from '../store/db.js';
import { getPushPublicKey } from '../store/push.js';

export const pushRouter = Router();

pushRouter.get('/api/push/public-key', requireAuth, (_req: Request, res: Response) => {
  const key = getPushPublicKey();
  if (!key) return res.status(503).json({ error: 'Push notifications are not configured' });
  res.json({ publicKey: key });
});

pushRouter.post('/api/push/subscribe', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const subscription = req.body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid push subscription' });
  }

  const record = {
    endpoint: String(subscription.endpoint),
    keys: { p256dh: String(subscription.keys.p256dh), auth: String(subscription.keys.auth) },
    userId,
    createdAt: new Date().toISOString(),
  };
  const existing = pushSubscriptions.findIndex((item) => item.endpoint === record.endpoint);
  if (existing >= 0) pushSubscriptions[existing] = record;
  else pushSubscriptions.push(record);
  res.status(201).json({ success: true });
});

pushRouter.delete('/api/push/subscribe', requireAuth, (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const endpoint = String(req.body?.endpoint || '');
  for (let index = pushSubscriptions.length - 1; index >= 0; index -= 1) {
    if (pushSubscriptions[index].userId === userId && pushSubscriptions[index].endpoint === endpoint) {
      pushSubscriptions.splice(index, 1);
    }
  }
  res.json({ success: true });
});