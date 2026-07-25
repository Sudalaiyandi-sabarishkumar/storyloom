import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as projectRepo from '../db/repositories/projectRepo.js';
import * as sceneAgent from '../agents/sceneAgent.js';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(async (req, res) => {
  res.json(await sceneAgent.listScenes(req.params.id));
}));

// GET /api/projects/:id/scenes/suggestions
// Next Scene Agent's proposed directions, grounded in the opening plot +
// cast + conflicts + scenes written so far. Regenerated on every call so the
// panel always reflects the current storyboard.
router.get('/suggestions', asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const storyContext = await projectRepo.buildStoryContext(projectId);
  if (!storyContext) return res.status(404).json({ error: 'Project not found' });

  const options = await sceneAgent.generateSceneOptions(projectId, storyContext);
  res.json({ options });
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

// PATCH /api/projects/:id/scenes/:sceneId  { title?, tone?, text? }
// Direct in-place edit from the scene card's "Edit" action.
router.patch('/:sceneId', asyncHandler(async (req, res) => {
  const { title, tone, text } = req.body || {};
  const scene = await sceneAgent.updateScene(req.params.id, req.params.sceneId, { title, tone, text });
  res.json(scene);
}));

router.delete('/:sceneId', asyncHandler(async (req, res) => {
  await sceneAgent.deleteScene(req.params.id, req.params.sceneId);
  res.status(204).end();
}));

// POST /api/projects/:id/scenes/:sceneId/regenerate
// Rewrites the scene's text in place from the scene card's "Regenerate" action.
router.post('/:sceneId/regenerate', asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const storyContext = await projectRepo.buildStoryContext(projectId);
  if (!storyContext) return res.status(404).json({ error: 'Project not found' });

  const scene = await sceneAgent.regenerateSceneInPlace(projectId, req.params.sceneId, storyContext);
  res.json(scene);
}));

export default router;
