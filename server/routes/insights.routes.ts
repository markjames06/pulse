import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { circles, locationShares, memoryPins, moments, pings, safetyCheckIns } from '../store/db.js';
import { getAuthUserId, requireAuth } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeText } from '../utils/sanitizer.js';

export const insightsRouter = Router();

function circleContext(circleId: string) {
  const now = Date.now();
  return {
    activeShares: Array.from(locationShares.values())
      .filter((share) => share.circleId === circleId && share.isActive && new Date(share.expiresAt).getTime() > now)
      .map((share) => ({ person: share.userProfile?.displayName || 'A member', activity: share.label || 'sharing location' })),
    recentPings: pings.filter((ping) => ping.circleId === circleId).slice(0, 10)
      .map((ping) => ({ from: ping.senderProfile?.displayName || 'A member', message: ping.message, when: ping.createdAt })),
    savedPlaces: memoryPins.filter((pin) => pin.circleId === circleId).slice(0, 10)
      .map((pin) => ({ name: pin.caption, place: pin.placeName || 'a saved place' })),
    upcomingMoments: moments.filter((moment) => moment.circleId === circleId && new Date(moment.startsAt).getTime() >= now).slice(0, 10)
      .map((moment) => ({ title: moment.title, place: moment.place, when: moment.startsAt })),
    checkIns: safetyCheckIns.filter((checkIn) => checkIn.circleId === circleId).slice(0, 10)
      .map((checkIn) => ({ person: checkIn.userProfile?.displayName || 'A member', status: checkIn.status })),
  };
}

function isMember(circleId: string, userId: string) {
  return circles.get(circleId)?.members.some((member) => member.userId === userId) === true;
}

function localBrief(context: ReturnType<typeof circleContext>) {
  const parts = [`${context.activeShares.length} member${context.activeShares.length === 1 ? '' : 's'} sharing live location.`];
  if (context.upcomingMoments.length) parts.push(`Next plan: ${context.upcomingMoments[0].title} at ${context.upcomingMoments[0].place}.`);
  if (context.checkIns.some((checkIn) => checkIn.status === 'missed')) parts.push('There is a missed safety check-in to review.');
  if (context.savedPlaces.length) parts.push(`${context.savedPlaces.length} saved place${context.savedPlaces.length === 1 ? '' : 's'} are available.`);
  return parts.join(' ');
}

async function generate(prompt: string, fallback: string) {
  if (!process.env.GEMINI_API_KEY) return { summary: fallback, source: 'local' as const };
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${prompt}\nBe concise, factual, and friendly. Do not invent details. Never expose latitude, longitude, or private information.`,
    });
    return { summary: result.text?.trim() || fallback, source: 'ai' as const };
  } catch (error) {
    console.error('Circle insight generation failed:', error);
    return { summary: fallback, source: 'local' as const };
  }
}

insightsRouter.get('/api/insights/brief', requireAuth, rateLimiter(20, 60000), async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = req.query.circleId as string;
  if (!circleId || !isMember(circleId, userId)) return res.status(403).json({ error: 'You are not a member of this circle' });
  const context = circleContext(circleId);
  const result = await generate(`Create a short status brief for this private circle using this activity data: ${JSON.stringify(context)}`, localBrief(context));
  res.json({ ...result, generatedAt: new Date().toISOString() });
});

insightsRouter.post('/api/insights/ask', requireAuth, rateLimiter(20, 60000), async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const circleId = String(req.body?.circleId || '');
  const question = sanitizeText(String(req.body?.question || '').trim());
  if (!circleId || !isMember(circleId, userId)) return res.status(403).json({ error: 'You are not a member of this circle' });
  if (!question || question.length > 240) return res.status(400).json({ error: 'Ask a question up to 240 characters.' });
  const context = circleContext(circleId);
  const result = await generate(`Answer this circle member question from the supplied data only. Question: ${question}\nData: ${JSON.stringify(context)}`, localBrief(context));
  res.json({ ...result, question, generatedAt: new Date().toISOString() });
});