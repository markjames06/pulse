import { createServer as createViteServer } from 'vite';
import app from './server/app';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Pulse server:', error);
  process.exit(1);
});