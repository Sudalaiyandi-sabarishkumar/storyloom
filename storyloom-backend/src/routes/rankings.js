import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import * as rankingAgent from '../agents/rankingAgent.js';

const router = Router();

// GET /api/rankings?refresh=true
// Matches the frontend seam: getRankings()
router.get('/rankings', requireRole('director'), asyncHandler(async (req, res) => {
  const forceRecompute = req.query.refresh === 'true';
  res.json(await rankingAgent.getRankings({ forceRecompute }));
}));

router.post('/projects/:id/rankings/recompute', requireRole('director'), asyncHandler(async (req, res) => {
  res.json(await rankingAgent.recomputeRanking(req.params.id));
}));

// GET /api/projects/:title/audience-simulation?refresh=true
// Matches the frontend seam: getAudienceSimulation(projectTitle)
router.get('/projects/by-title/:title/audience-simulation', requireRole('director'), asyncHandler(async (req, res) => {
  const forceRecompute = req.query.refresh === 'true';
  const result = await rankingAgent.getAudienceSimulation(decodeURIComponent(req.params.title), { forceRecompute });
  res.json(result);
}));

export default router;
