import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip) || 'unknown';
  return createHash('sha256').update(ip.trim()).digest('hex').slice(0, 16);
}

export function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${clientKey(req)}_${req.method}_${req.path}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    record.count += 1;
    next();
  };
}
