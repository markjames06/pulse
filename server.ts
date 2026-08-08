import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { locationShares } from './server/store/db';
import { usersRouter } from './server/routes/users.routes';
import { circlesRouter } from './server/routes/circles.routes';
import { sharesRouter } from './server/routes/shares.routes';
import { pingsRouter } from './server/routes/pings.routes';
import { memoryPinsRouter } from './server/routes/memoryPins.routes';
import { notificationsRouter } from './server/routes/notifications.routes';

const app = express();
const PORT = 3000;

app.use(express.json());

// Scheduled cleanup for expired location shares older than 24 hours
setInterval(() => {
  const now = new Date().getTime();
  const cutoff = now - 24 * 60 * 60 * 1000;

  for (const [id, share] of locationShares.entries()) {
    const expireTime = new Date(share.expiresAt).getTime();
    if (expireTime < cutoff) {
      locationShares.delete(id);
    }
  }
}, 60 * 1000);

// API Route Modules Registration
app.use(usersRouter);
app.use(circlesRouter);
app.use(sharesRouter);
app.use(pingsRouter);
app.use(memoryPinsRouter);
app.use(notificationsRouter);

// Catch-all for unknown API endpoints
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global Express Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse server running on http://localhost:${PORT}`);
  });
}

startServer();
