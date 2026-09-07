export type PlanId = 'free' | 'plus' | 'family';

export interface UpgradeInterest {
  id: string;
  userId: string;
  plan: Exclude<PlanId, 'free'>;
  createdAt: string;
}