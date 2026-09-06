import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { usersRouter } from './routes/users.routes';
import { circlesRouter } from './routes/circles.routes';
import { sharesRouter } from './routes/shares.routes';
import { pingsRouter } from './routes/pings.routes';
import { memoryPinsRouter } from './routes/memoryPins.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { locationShares } from './store/db';
import { hydrateStore, persistStore } from './store/persist';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

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
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    for (const [id, share] of locationShares.entries()) {
      if (new Date(share.expiresAt).getTime() < cutoff) {
        locationShares.delete(id);
      }
    }
  }, 60 * 1000).unref?.();
}

app.use(usersRouter);
app.use(circlesRouter);
app.use(sharesRouter);
app.use(pingsRouter);
app.use(memoryPinsRouter);
app.use(notificationsRouter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'pulse',
  });
});

app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

if (isProduction && !isVercel) {
  const distPath = path.resolve(__dirname, '../dist');

  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
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
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
});

export default app;
