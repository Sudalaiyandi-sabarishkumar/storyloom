import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as projectRepo from '../db/repositories/projectRepo.js';
import * as sceneAgent from '../agents/sceneAgent.js';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(async (req, res) => {
  res.json(await sceneAgent.listScenes(req.params.id));
}));

// POST /api/projects/:id/scenes  { option, regenerate?: boolean }
// Matches the frontend seam: generateNextScene(option, storyContext)
router.post('/', asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { option, regenerate } = req.body || {};
  if (!option?.title) return res.status(400).json({ error: 'option is required' });

  const storyContext = await projectRepo.buildStoryContext(projectId);
  if (!storyContext) return res.status(404).json({ error: 'Project not found' });

  const result = await sceneAgent.generateNextScene(projectId, option, storyContext, { regenerate: Boolean(regenerate) });
  res.json(result);
}));

router.get('/generations', asyncHandler(async (req, res) => {
  res.json(await sceneAgent.getSceneGenerationHistory(req.params.id, req.query.optionId));
}));

// Writer picks one of the generated candidates -> commits it as an accepted scene.
router.post('/generations/:generationId/accept', asyncHandler(async (req, res) => {
  const scene = await sceneAgent.acceptScene(req.params.id, req.params.generationId);
  res.status(201).json(scene);
}));

export default router;
