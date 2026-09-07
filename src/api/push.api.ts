import { apiFetch } from './client';

export const pushApi = {
  getPublicKey: () => apiFetch<{ publicKey: string }>('/api/push/public-key'),
  subscribe: (subscription: PushSubscriptionJSON) =>
    apiFetch<{ success: boolean }>('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    }),
};
