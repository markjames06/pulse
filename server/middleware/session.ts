import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';

const COOKIE_NAME = 'pulse_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

  if (secret) return secret;
  if (!isProduction) return 'pulse-dev-session-secret';

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
    return '';
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return '';
  }

  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const valid = Buffer.from(expected);

  if (provided.length !== valid.length || !timingSafeEqual(provided, valid)) {
    return '';
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      exp?: number;
    };

    if (!data.sub || typeof data.exp !== 'number' || data.exp < Date.now()) {
      return '';
    }

    if (!/^usr_[a-zA-Z0-9_]+$/.test(data.sub)) {
      return '';
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
    return '';
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return '';
  }

  const expected = sign(payload);
  const provided = Buffer.from(signature);
  const valid = Buffer.from(expected);

  if (provided.length !== valid.length || !timingSafeEqual(provided, valid)) {
    return '';
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      exp?: number;
    };

    if (!data.sub || typeof data.exp !== 'number' || data.exp < Date.now()) {
      return '';
    }

    if (!/^usr_[a-zA-Z0-9_]+$/.test(data.sub)) {
      return '';
    }

    return data.sub;
  } catch {
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

  res.setHeader('Set-Cookie', attributes.join('; '));
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
