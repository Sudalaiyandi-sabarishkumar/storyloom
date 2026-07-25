import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as projectRepo from '../db/repositories/projectRepo.js';
import * as graphAgent from '../agents/graphAgent.js';

const router = Router({ mergeParams: true });

// GET /api/projects/:id/knowledge-graph
// Derived live from the project's characters/relationships/scenes, so it
// always reflects whatever has been generated so far (opening plot's cast,
// plus any accepted scenes).
router.get('/knowledge-graph', asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const storyContext = await projectRepo.buildStoryContext(projectId);
  if (!storyContext) return res.status(404).json({ error: 'Project not found' });

  res.json(graphAgent.getKnowledgeGraph(storyContext));
}));

export default router;
