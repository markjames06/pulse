import { Request } from 'express';
import { users } from '../store/db';

export function getAuthUserId(req: Request): string {
  const userId = req.headers['x-user-id'];

  if (typeof userId !== 'string' || !userId.trim()) {
    return '';
  }

  if (!users.has(userId)) {
    return '';
  }

  return userId;
}