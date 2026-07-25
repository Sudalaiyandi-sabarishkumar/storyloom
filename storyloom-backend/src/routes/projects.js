import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
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
  genres: z.array(z.string()).default([]),
  themes: z.array(z.string()).default([]),
  background: z.string().optional().default(''),
  coreStory: z.string().optional().default(''),
  timeline: z.string().optional().default(''),
  resolution: z.string().optional().default(''),
  characters: z.array(characterSchema).default([]),
  conflicts: z.array(z.object({ conflict: z.string(), hook: z.string() })).default([]),
});

router.get('/', asyncHandler(async (req, res) => {
  res.json(await projectRepo.listProjects());
}));

router.post('/', asyncHandler(async (req, res) => {
  const input = createProjectSchema.parse(req.body);
  const project = await projectRepo.createProject(input);
  res.status(201).json(project);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const project = await projectRepo.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
}));

const updateProjectSchema = createProjectSchema.partial();

router.patch('/:id', asyncHandler(async (req, res) => {
  const input = updateProjectSchema.parse(req.body);
  const project = await projectRepo.updateProject(req.params.id, input);
  res.json(project);
}));

// POST /api/projects/:id/submit — moves a story from Creator Studio's draft
// state into Director's Room by flipping status away from 'draft'.
router.post('/:id/submit', asyncHandler(async (req, res) => {
  const project = await projectRepo.updateProjectStatus(req.params.id, 'in_review');
  res.json(project);
}));

export default router;
