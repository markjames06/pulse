import { Request, Response, NextFunction } from 'express';
import { users } from '../store/db.js';
import { getTokenFromRequest, readSessionUserId, clearSessionCookie } from './session.js';

export function getAuthUserId(req: Request): string {
  const token = getTokenFromRequest(req);
  console.log('getAuthUserId: Token present:', !!token);
  const userId = readSessionUserId(token);
  console.log('getAuthUserId: User ID from session:', userId);
  console.log('getAuthUserId: User exists in store:', userId ? users.has(userId) : 'N/A');

  if (!userId || !users.has(userId)) {
    return '';
  }

  return userId;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getAuthUserId(req);
  if (!userId) {
    console.log('requireAuth: Authentication failed');
    // Clear invalid session cookie if present
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Please sign in to continue' });
  }

  console.log('requireAuth: Authentication successful for user:', userId);
  next();
}
