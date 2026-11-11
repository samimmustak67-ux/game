import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { gameServer } from './src/server/gameServer.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Authoritative 30 tick/s WebSocket Game Server
  gameServer.initialize(server);

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', game: 'Call of Battle: Anime Edition', tickRate: 30 });
  });

  app.get('/api/leaderboard', (req, res) => {
    res.json({ leaderboard: gameServer.getLeaderboard() });
  });

  app.get('/api/rooms', (req, res) => {
    res.json({ rooms: gameServer.getActiveRooms() });
  });

  // Attach Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Call of Battle] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
