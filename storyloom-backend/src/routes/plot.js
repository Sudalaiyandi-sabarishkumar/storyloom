import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as projectRepo from '../db/repositories/projectRepo.js';
import * as plotAgent from '../agents/plotAgent.js';

const router = Router({ mergeParams: true });

// POST /api/projects/:id/opening-plot  { regenerate?: boolean }
// Matches the frontend seam: generateOpeningPlot(storyContext)
router.post('/opening-plot', asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const storyContext = await projectRepo.buildStoryContext(projectId);
  if (!storyContext) return res.status(404).json({ error: 'Project not found' });

  const regenerate = Boolean(req.body?.regenerate);
  const result = await plotAgent.generateOpeningPlot(projectId, storyContext, { regenerate });
  res.json(result);
}));

router.get('/opening-plot/history', asyncHandler(async (req, res) => {
  res.json(await plotAgent.getPlotHistory(req.params.id));
}));

router.post('/opening-plot/:generationId/select', asyncHandler(async (req, res) => {
  await plotAgent.selectPlotVersion(req.params.id, req.params.generationId);
  res.status(204).end();
}));

// PATCH /api/projects/:id/opening-plot  { text }
// Direct in-place edit from the opening-plot card's "Edit" action.
router.patch('/opening-plot', asyncHandler(async (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== 'string') return res.status(400).json({ error: 'text is required' });
  const result = await plotAgent.updatePlotText(req.params.id, text);
  res.json(result);
}));

// POST /api/projects/:id/opening-plot/clear
// "Delete" on the opening-plot card — deselects it without losing history.
router.post('/opening-plot/clear', asyncHandler(async (req, res) => {
  await plotAgent.clearOpeningPlot(req.params.id);
  res.status(204).end();
}));

export default router;
