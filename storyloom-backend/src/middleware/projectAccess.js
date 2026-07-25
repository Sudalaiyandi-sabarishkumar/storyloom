import * as projectRepo from '../db/repositories/projectRepo.js';
import { asyncHandler } from './errorHandler.js';

/**
 * Gates every /api/projects/:id/* sub-route (plot, scenes, review, graph).
 * Directors own nothing but need read/download access to every story, so
 * they always pass; creators must own the project.
 */
export const loadProjectForAccess = asyncHandler(async (req, res, next) => {
  // Several sibling routers (plot/review/graph) share the same
  // /api/projects/:id prefix, so this can run more than once per request as
  // Express falls through unmatched routers — req persists across that
  // whole chain, so skip the repeat DB round-trip once we've already checked.
  if (req.project) return next();

  const project = await projectRepo.getProjectOwnership(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (req.user.role === 'creator' && project.created_by !== req.user.id) {
    return res.status(403).json({ error: 'Not your project' });
  }
  req.project = project;
  next();
});
