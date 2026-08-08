import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}_${req.baseUrl}${req.path}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    record.count += 1;
    next();
  };
}
