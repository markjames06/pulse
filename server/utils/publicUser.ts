import { UserProfile } from '../../src/types/index.js';

export function publicUser(user: UserProfile): UserProfile {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export const AVATAR_COLORS = [
  'bg-zinc-800',
  'bg-rose-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-sky-600',
  'bg-violet-600',
] as const;

export function safeAvatarColor(color?: string): string {
  if (color && AVATAR_COLORS.includes(color as (typeof AVATAR_COLORS)[number])) {
    return color;
  }
  return 'bg-zinc-800';
}
