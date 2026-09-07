import { apiFetch } from './client';
import { PlanId } from '../types';

export const billingApi = {
  getPlans: () => apiFetch<{ plans: { id: PlanId; name: string; price: string; description: string }[] }>('/api/billing/plans'),
  requestUpgrade: (plan: Exclude<PlanId, 'free'>) =>
    apiFetch<{ success: boolean; message: string }>('/api/billing/interest', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }),
};
