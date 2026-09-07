import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { usersRouter } from './routes/users.routes.js';
import { circlesRouter } from './routes/circles.routes.js';
import { sharesRouter } from './routes/shares.routes.js';
import { pingsRouter } from './routes/pings.routes.js';
import { memoryPinsRouter } from './routes/memoryPins.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { checkInsRouter } from './routes/checkIns.routes.js';
import { momentsRouter } from './routes/moments.routes.js';
import { pushRouter } from './routes/push.routes.js';
import { insightsRouter } from './routes/insights.routes.js';
import { circles, locationShares, notifications, safetyCheckIns, users } from './store/db.js';
import { hydrateStore, persistStore } from './store/persist.js';
import { securityHeaders } from './middleware/security.middleware.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { publishCircleEvent } from './store/events.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use('/api', rateLimiter(120, 60 * 1000));

app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await hydrateStore();
  } catch (error) {
    console.error('Store hydrate failed:', error);
  }

  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(_req.method);
  if (mutating) {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        void persistStore();
      }
    });
  }

  next();
});

if (!isVercel) {
  setInterval(() => {
    for (const [id, share] of locationShares.entries()) {
      if (new Date(share.expiresAt).getTime() <= Date.now()) {
        share.isActive = false;
        locationShares.delete(id);
      }
    }

    for (const checkIn of safetyCheckIns) {
      if (checkIn.status !== 'active' || new Date(checkIn.expiresAt).getTime() > Date.now()) continue;
      checkIn.status = 'missed';
      const user = users.get(checkIn.userId);
      const circle = circles.get(checkIn.circleId);
      if (!user || !circle) continue;
      const notification = {
        id: `notif_checkin_${checkIn.id}`,
        circleId: checkIn.circleId,
        type: 'check_in_missed' as const,
        title: `${user.displayName} missed a safety check-in`,
        body: `${user.displayName} did not confirm they were safe before the timer ended.`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      notifications.unshift(notification);
      publishCircleEvent(checkIn.circleId, { checkIn, notification });
    }
  }, 60 * 1000).unref?.();
}

app.use(usersRouter);
app.use(circlesRouter);
app.use(sharesRouter);
app.use(pingsRouter);
app.use(memoryPinsRouter);
app.use(notificationsRouter);
app.use(checkInsRouter);
app.use(momentsRouter);
app.use(pushRouter);
app.use(insightsRouter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'pulse',
  });
});

app.all('/api/{*path}', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

if (isProduction && !isVercel) {
  const distPath = path.resolve(__dirname, '../dist');

  app.use(express.static(distPath));

  app.get('{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  const status =
    typeof err === 'object' && err && 'status' in err && typeof err.status === 'number'
      ? err.status
      : 500;
  const message =
    status >= 500 && isProduction
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';
  res.status(status).json({ error: message });
});

export default app;
