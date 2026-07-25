import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import * as projectRepo from '../db/repositories/projectRepo.js';
import * as reviewAgent from '../agents/reviewAgent.js';
import * as sceneAgent from '../agents/sceneAgent.js';

const router = Router({ mergeParams: true });

// GET /api/projects/:id/feedback?refresh=true
// Matches the frontend seam: getFeedback(storyId)
router.get('/feedback', asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const refresh = req.query.refresh === 'true';
  const storyContext = refresh ? await projectRepo.buildStoryContext(projectId) : null;
  const feedback = await reviewAgent.getFeedback(projectId, storyContext, { useCache: !refresh });
  res.json(feedback);
}));

// POST /api/projects/:id/impact-check  { entityName }
// Matches the frontend seam: checkImpact(entityName, storyId)
router.post('/impact-check', requireRole('creator'), asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { entityName } = req.body || {};
  if (!entityName) return res.status(400).json({ error: 'entityName is required' });

  const storyContext = await projectRepo.buildStoryContext(projectId);
  if (!storyContext) return res.status(404).json({ error: 'Project not found' });

  const result = await reviewAgent.checkImpact(entityName, projectId, storyContext);
  res.json(result);
}));

// POST /api/projects/:id/impact-check/remove  { entityName }
// Backs the impact-check modal's "Remove anyway" button — tries a matching
// character first, then a matching scene title.
router.post('/impact-check/remove', requireRole('creator'), asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { entityName } = req.body || {};
  if (!entityName) return res.status(400).json({ error: 'entityName is required' });

  if (await projectRepo.deleteCharacterByName(projectId, entityName)) {
    return res.json({ removed: true, type: 'character' });
  }
  if (await sceneAgent.deleteSceneByTitle(projectId, entityName)) {
    return res.json({ removed: true, type: 'scene' });
  }
  res.status(404).json({ removed: false, error: `No character or scene named "${entityName}" found` });
}));

export default router;
