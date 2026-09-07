import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { upgradeInterests } from '../store/db.js';

export const billingRouter = Router();

const interestSchema = z.object({ plan: z.enum(['plus', 'family']) });

billingRouter.get('/api/billing/plans', (_req: Request, res: Response) => {
  res.json({
    plans: [
      { id: 'free', name: 'Free', price: '$0', description: 'The essentials for one trusted circle.' },
      { id: 'plus', name: 'Plus', price: '$4.99 / month', description: 'Automation and history for people who rely on Pulse every day.' },
      { id: 'family', name: 'Family', price: '$9.99 / month', description: 'A calmer safety net for the whole household.' },
    ],
  });
});

billingRouter.post('/api/billing/interest', requireAuth, (req: Request, res: Response) => {
  const parsed = interestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Choose a valid plan.' });
  const userId = getAuthUserId(req);
  const existing = upgradeInterests.find((interest) => interest.userId === userId && interest.plan === parsed.data.plan);
  if (!existing) {
    upgradeInterests.push({
      id: `interest_${Date.now()}`,
      userId,
      plan: parsed.data.plan,
      createdAt: new Date().toISOString(),
    });
  }
  res.status(201).json({ success: true, message: 'Thanks. We will let you know when this plan is ready.' });
});
