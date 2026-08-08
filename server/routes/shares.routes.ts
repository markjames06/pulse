import { Router, Request, Response } from 'express';
import {
  locationShares,
  users,
  circles,
  notifications,
} from '../store/db';
import { getAuthUserId } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { sanitizeText } from '../utils/sanitizer';
import {
  createShareSchema,
  updateLocationSchema,
  LocationShare,
} from '../../src/types';

export const sharesRouter = Router();

sharesRouter.get(
  '/api/shares',
  (req: Request, res: Response) => {
    const userId = getAuthUserId(req);
    const circleId = req.query.circleId as string;

    const now = new Date();

    const activeShares = Array.from(
      locationShares.values()
    ).filter((share) => {
      if (new Date(share.expiresAt) <= now) {
        locationShares.delete(share.id);
        return false;
      }

      if (!share.isActive) {
        return false;
      }

      if (
        circleId &&
        share.circleId !== circleId
      ) {
        return false;
      }

      const circle = circles.get(share.circleId);

      return circle?.members.some(
        (member) => member.userId === userId
      );
    });

    res.json(activeShares);
  }
);

// KEEP YOUR OTHER ROUTES BELOW THIS