import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireRole } from '../middleware/auth.js';
import * as projectRepo from '../db/repositories/projectRepo.js';

const router = Router();

const characterSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string().optional().default(''),
  relationships: z.array(z.string()).optional().default([]),
});

const createProjectSchema = z.object({
  title: z.string().min(1),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  themes: z.array(z.string()).default([]),
  background: z.string().optional().default(''),
  coreStory: z.string().optional().default(''),
  timeline: z.string().optional().default(''),
  resolution: z.string().optional().default(''),
  characters: z.array(characterSchema).default([]),
  conflicts: z.array(z.object({ conflict: z.string(), hook: z.string() })).default([]),
});

/** 404s if missing, 403s if a creator doesn't own it. Directors always pass. */
async function requireOwnership(req) {
  const existing = await projectRepo.getProjectOwnership(req.params.id);
  if (!existing) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  if (req.user.role === 'creator' && existing.created_by !== req.user.id) {
    const err = new Error('Not your project');
    err.status = 403;
    throw err;
  }
  return existing;
}

// Creators see only their own stories ("My Stories"); directors see everyone's.
router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'creator' ? { createdBy: req.user.id } : {};
  res.json(await projectRepo.listProjects(filter));
}));

router.post('/', requireRole('creator'), asyncHandler(async (req, res) => {
  const input = createProjectSchema.parse(req.body);
  const project = await projectRepo.createProject({ ...input, createdBy: req.user.id });
  res.status(201).json(project);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  await requireOwnership(req);
  const project = await projectRepo.getProject(req.params.id);
  res.json(project);
}));

const updateProjectSchema = createProjectSchema.partial();

router.patch('/:id', requireRole('creator'), asyncHandler(async (req, res) => {
  await requireOwnership(req);
  const input = updateProjectSchema.parse(req.body);
  const project = await projectRepo.updateProject(req.params.id, input);
  res.json(project);
}));

// POST /api/projects/:id/submit — moves a story from Creator Studio's draft
// state into Director's Room by flipping status away from 'draft'.
router.post('/:id/submit', requireRole('creator'), asyncHandler(async (req, res) => {
  await requireOwnership(req);
  const project = await projectRepo.updateProjectStatus(req.params.id, 'in_review');
  res.json(project);
}));

export default router;
