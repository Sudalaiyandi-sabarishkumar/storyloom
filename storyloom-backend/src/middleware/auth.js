import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, displayName: user.display_name ?? user.displayName },
    config.auth.jwtSecret,
    { expiresIn: config.auth.tokenExpiry }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, config.auth.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: `This action requires the ${role} role` });
    }
    next();
  };
}
