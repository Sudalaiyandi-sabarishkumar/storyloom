import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import projectsRouter from './routes/projects.js';
import plotRouter from './routes/plot.js';
import scenesRouter from './routes/scenes.js';
import reviewRouter from './routes/review.js';
import rankingsRouter from './routes/rankings.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

  // AI generation calls are the expensive/slow ones — keep a sane rate limit.
  const aiLimiter = rateLimit({ windowMs: 60_000, limit: 30 });
  app.use('/api/projects/:id/opening-plot', aiLimiter);
  app.use('/api/projects/:id/scenes', aiLimiter);
  app.use('/api/projects/:id/impact-check', aiLimiter);

  app.get('/health', (req, res) => res.json({ ok: true, env: config.env }));

  app.use('/api/projects', projectsRouter);
  app.use('/api/projects/:id', plotRouter);
  app.use('/api/projects/:id/scenes', scenesRouter);
  app.use('/api/projects/:id', reviewRouter);
  app.use('/api', rankingsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
