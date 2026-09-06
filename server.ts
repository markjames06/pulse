import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import app from './server/app';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Pulse server running on http://localhost:${PORT}`);
      resolve();
    });

    server.on('error', reject);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Pulse server:', error);
  process.exit(1);
});
