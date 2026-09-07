import React, { useState } from 'react';
import { Check, Crown, Shield, Sparkles } from 'lucide-react';
import { api } from '../../api';
import { PlanId } from '../../types';

const plans: { id: PlanId; name: string; price: string; description: string; features: string[] }[] = [
  {
    id: 'free', name: 'Free', price: '$0', description: 'The essentials for one trusted circle.',
    features: ['One trusted circle', 'Live location sharing', 'Pings and saved places', 'Safety check-ins'],
  },
  {
    id: 'plus', name: 'Plus', price: '$4.99 / month', description: 'More context and automation for everyday life.',
    features: ['Everything in Free', 'Unlimited circle history', 'Arrival reminders', 'AI Circle Briefs'],
  },
  {
    id: 'family', name: 'Family', price: '$9.99 / month', description: 'A calmer safety net for the whole household.',
    features: ['Everything in Plus', 'Up to five trusted circles', 'Household safety routines', 'Priority support'],
  },
];

interface PlansViewProps {
  circleName: string;
}

export const PlansView: React.FC<PlansViewProps> = ({ circleName }) => {
  const [requested, setRequested] = useState<PlanId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const requestPlan = async (plan: Exclude<PlanId, 'free'>) => {
    setIsSaving(true);
    setMessage('');
    try {
      const result = await api.requestUpgrade(plan);
      setRequested(plan);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save your request.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pulse-content max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      <div className="pulse-header space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Pulse for {circleName}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Plans that respect your privacy</h2>
        <p className="text-sm text-slate-500">Start free. Upgrade when your circle needs more safety and context.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isFeatured = plan.id === 'plus';
          return (
            <article key={plan.id} className={`pulse-card relative rounded-xl border p-5 flex flex-col ${isFeatured ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-gray-200'} bg-white`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {plan.id === 'free' ? <Shield className="w-5 h-5 text-zinc-500 shrink-0" /> : plan.id === 'plus' ? <Sparkles className="w-5 h-5 text-blue-600 shrink-0" /> : <Crown className="w-5 h-5 text-amber-500 shrink-0" />}
                  <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                </div>
                {isFeatured && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold leading-none text-blue-700">Most popular</span>}
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-900">{plan.price}</p>
              <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{plan.description}</p>
              <ul className="mt-5 space-y-3 flex-1 border-t border-gray-100 pt-4">
                {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs text-slate-700"><Check className="w-4 h-4 text-emerald-600 shrink-0" />{feature}</li>)}
              </ul>
              {plan.id === 'free' ? (
                <span className="mt-6 rounded-lg border border-gray-200 px-3 py-2.5 text-center text-xs font-semibold text-slate-500">Current plan</span>
              ) : (
                <button type="button" disabled={isSaving} onClick={() => void requestPlan(plan.id as 'plus' | 'family')} className="mt-6 rounded-lg bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
                  {requested === plan.id ? 'Request received' : `Request ${plan.name}`}
                </button>
              )}
            </article>
          );
        })}
      </div>
      {message && <p className="text-center text-sm text-slate-600">{message}</p>}
      <p className="text-center text-[11px] text-slate-400">Plans are in early access. You will not be charged by this request.</p>
    </div>
  );
};
