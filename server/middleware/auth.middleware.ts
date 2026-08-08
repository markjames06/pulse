import { Request } from 'express';
import { users } from '../store/db';

export function getAuthUserId(req: Request): string {
  const authHeader = req.headers['x-user-id'] as string;
  if (authHeader && users.has(authHeader)) {
    return authHeader;
  }
  const allUsers = Array.from(users.values());
  if (allUsers.length > 0) {
    return allUsers[0].id;
  }
  return '';
}
