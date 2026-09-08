import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';

const COOKIE_NAME = 'pulse_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  if (secret) {
    console.log('Using SESSION_SECRET from environment variables');
    return secret;
  }
  if (!isProduction) {
    console.log('Using development session secret');
    return 'pulse-dev-session-secret';
  }

  // Production - SESSION_SECRET is required
  console.error('CRITICAL: SESSION_SECRET not configured in production');
  console.error('The application will not work without SESSION_SECRET');
  console.error('Please configure SESSION_SECRET in Vercel environment variables');
  throw new Error('SESSION_SECRET must be configured in production');
}

function sign(payload: string) {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      exp: Date.now() + SESSION_TTL_MS,
    })
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

export function readSessionUserId(token?: string | null): string {
  if (!token || !token.includes('.')) {
    console.log('Session validation failed: No token or invalid format');
    return '';
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    console.log('Session validation failed: Missing payload or signature');
    return '';
  }

  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const valid = Buffer.from(expected);

  if (provided.length !== valid.length || !timingSafeEqual(provided, valid)) {
    console.log('Session validation failed: Signature mismatch');
    return '';
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      exp?: number;
    };

    if (!data.sub || typeof data.exp !== 'number' || data.exp < Date.now()) {
      console.log('Session validation failed: Invalid user ID or expired token');
      return '';
    }

    if (!/^usr_[a-zA-Z0-9_]+$/.test(data.sub)) {
      console.log('Session validation failed: Invalid user ID format');
      return '';
    }

    console.log('Session validation successful for user:', data.sub);
    return data.sub;
  } catch (error) {
    console.log('Session validation failed: Parse error', error);
    return '';
  }
}

export function readCookie(req: Request, name = COOKIE_NAME): string {
  const header = req.headers.cookie;
  if (!header) return '';

  const parts = header.split(';');
  for (const part of parts) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join('='));
    }
  }

  return '';
}

export function setSessionCookie(res: Response, userId: string) {
  const token = createSessionToken(userId);
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const attributes = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=' + (isProduction ? 'None' : 'Lax'),
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];

  if (isProduction) {
    attributes.push('Secure');
  }

  const cookieValue = attributes.join('; ');
  res.setHeader('Set-Cookie', cookieValue);
  console.log('Set session cookie for user:', userId, 'Production:', isProduction);
  return token;
}

export function clearSessionCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const attributes = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=' + (isProduction ? 'None' : 'Lax'),
    'Max-Age=0',
  ];

  if (isProduction) {
    attributes.push('Secure');
  }

  res.setHeader('Set-Cookie', attributes.join('; '));
}

export function getTokenFromRequest(req: Request): string {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return readCookie(req);
}
