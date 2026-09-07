import { apiFetch } from './client';
import { CircleInsight, CircleQuestionAnswer } from '../types';

export const insightsApi = {
  getCircleBrief: (circleId: string) =>
    apiFetch<CircleInsight>(`/api/insights/brief?circleId=${encodeURIComponent(circleId)}`),
  askCircleQuestion: (circleId: string, question: string) =>
    apiFetch<CircleQuestionAnswer>('/api/insights/ask', {
      method: 'POST',
      body: JSON.stringify({ circleId, question }),
    }),
};