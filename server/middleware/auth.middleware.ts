import { Request, Response, NextFunction } from 'express';
import { users } from '../store/db.js';
import { getTokenFromRequest, readSessionUserId, clearSessionCookie } from './session.js';

export function getAuthUserId(req: Request): string {
  const userId = readSessionUserId(getTokenFromRequest(req));

  if (!userId || !users.has(userId)) {
    return '';
  }

  return userId;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getAuthUserId(req);
  if (!userId) {
    // Clear invalid session cookie if present
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Please sign in to continue' });
  }

  next();
}
