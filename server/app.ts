import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { usersRouter } from './routes/users.routes';
import { circlesRouter } from './routes/circles.routes';
import { sharesRouter } from './routes/shares.routes';
import { pingsRouter } from './routes/pings.routes';
import { memoryPinsRouter } from './routes/memoryPins.routes';
import { notificationsRouter } from './routes/notifications.routes';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(usersRouter);
app.use(circlesRouter);
app.use(sharesRouter);
app.use(pingsRouter);
app.use(memoryPinsRouter);
app.use(notificationsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'pulse',
  });
});

// Production frontend
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');

  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;