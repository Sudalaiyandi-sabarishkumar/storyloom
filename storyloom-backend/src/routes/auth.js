import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import * as userRepo from '../db/repositories/userRepo.js';

const router = Router();

const authLimiter = rateLimit({ windowMs: 60_000, limit: 20 });

const signupSchema = z.object({
  username: z.string().min(3).max(40),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80),
});

function toPublicUser(user) {
  return { id: user.id, username: user.username, role: user.role, displayName: user.display_name };
}

// POST /api/auth/signup — always creates role: 'creator'. There is no
// client-controlled way to create a director account (see db/migrate.js).
router.post('/signup', authLimiter, asyncHandler(async (req, res) => {
  const input = signupSchema.parse(req.body);

  const existing = await userRepo.findByUsername(input.username);
  if (existing) return res.status(409).json({ error: 'That username is taken' });

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await userRepo.createUser({
    username: input.username,
    passwordHash,
    role: 'creator',
    displayName: input.displayName,
  });

  const publicUser = { id: user.id, username: user.username, role: user.role, displayName: user.displayName };
  res.status(201).json({ token: signToken(publicUser), user: publicUser });
}));

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);

  const user = await userRepo.findByUsername(input.username);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

  const publicUser = toPublicUser(user);
  res.json({ token: signToken(publicUser), user: publicUser });
}));

// GET /api/auth/me — restores a session from a stored token on page load.
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;
