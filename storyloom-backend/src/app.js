import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { loadProjectForAccess } from './middleware/projectAccess.js';

import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import plotRouter from './routes/plot.js';
import scenesRouter from './routes/scenes.js';
import reviewRouter from './routes/review.js';
import rankingsRouter from './routes/rankings.js';
import graphRouter from './routes/graph.js';

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

  app.use('/api/auth', authRouter);

  // Every /api/projects* route requires a session; projectsRouter enforces
  // its own per-route role/ownership rules (create is creator-only, reads
  // allow the owning creator or any director, etc). The four project-scoped
  // sub-routers additionally load + authorize the specific :id via
  // loadProjectForAccess before their own routes ever run.
  app.use('/api/projects', requireAuth, projectsRouter);
  app.use('/api/projects/:id', requireAuth, loadProjectForAccess, plotRouter);
  app.use('/api/projects/:id/scenes', requireAuth, loadProjectForAccess, scenesRouter);
  app.use('/api/projects/:id', requireAuth, loadProjectForAccess, reviewRouter);
  app.use('/api/projects/:id', requireAuth, loadProjectForAccess, graphRouter);
  // Rankings/audience-simulation/recompute are Director Room only — nothing
  // in Creator Studio ever calls these.
  app.use('/api', requireAuth, requireRole('director'), rankingsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
