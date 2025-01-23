// src/index.ts
import { Hono } from 'hono';
import { logMiddleware } from './middlewares/logger';
import { corsMiddleware } from './middlewares/cors';
import { authMiddleware } from './middlewares/auth';
import { apiVersion } from './apiVersion';
import { tracks } from './routes/tracks';
import { artists } from './routes/artists';
import { playlists } from './routes/playlists';

const app = new Hono();

app.use('*', logMiddleware);
app.use('*', corsMiddleware);
app.use('/admin/*', authMiddleware);
app.use('*', apiVersion('1.0'));

// Mount Routes
app.route('/api/v1/tracks', tracks);
app.route('/api/v1/artists', artists);
app.route('/api/v1/playlists', playlists);

// Health Check
app.get('/health', (c) => c.json({
  status: 'healthy',
  version: '1.0.0',
  apiVersions: ['1.0'],
  serverTime: new Date().toISOString(),
}));

export default app;
