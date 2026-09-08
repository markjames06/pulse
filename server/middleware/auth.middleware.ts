import { Request, Response, NextFunction } from 'express';
import { users } from '../store/db.js';
import { getTokenFromRequest, readSessionUserId, clearSessionCookie } from './session.js';

export function getAuthUserId(req: Request): string {
  const token = getTokenFromRequest(req);
  const userId = readSessionUserId(token);

  if (!userId) {
    console.log('Authentication failed: No valid user ID from token');
    return '';
  }

  if (!users.has(userId)) {
    console.log('Authentication failed: User not found in store:', userId);
    return '';
  }

  console.log('Authentication successful for user:', userId);
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
