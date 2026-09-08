import React, { useState } from 'react';
import { ArrowRight, Bell, Check, Map, ShieldCheck, X, Zap, RefreshCw } from 'lucide-react';

interface OnboardingTutorialProps {
  onFinish: () => void;
  isReRegistration?: boolean;
}

const steps = [
  { icon: Map, label: 'Map', title: 'Start with your circle', body: 'Your map is only for people you invite. Create a circle or join one with an invite code.', cue: 'Map • See your trusted people' },
  { icon: ShieldCheck, label: 'Share', title: 'Share only when you choose', body: 'Use Share to send your live location for a set time. You can stop it at any moment.', cue: 'Share • Choose how long' },
  { icon: Zap, label: 'Ping', title: 'Send a quick update', body: 'Ping your circle when you arrive, need attention, or want to share a place on the map.', cue: 'Ping • Send an instant update' },
  { icon: Bell, label: 'Alerts', title: 'Stay in the loop', body: 'Turn on device alerts for important updates, safety check-ins, and new circle activity.', cue: 'Alerts • Know when it matters' },
];

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onFinish, isReRegistration = false }) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  // Clear localStorage tutorial completion for re-registrations
  React.useEffect(() => {
    if (isReRegistration) {
      localStorage.removeItem('pulse:tutorial-complete');
    }
  }, [isReRegistration]);

  return (
    <div className="fixed inset-0 z-[1400] flex items-end justify-center bg-[#111318]/45 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="onboarding-card w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_28px_90px_rgba(17,19,24,.22)] sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isReRegistration && <RefreshCw className="h-4 w-4 text-[#2855ff]" />}
            <span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#2855ff]">
              {isReRegistration ? 'Welcome back to Pulse' : 'Welcome to Pulse'}
            </span>
          </div>
          <button type="button" onClick={onFinish} className="rounded-full p-2 text-[#73766f] hover:bg-[#f1f2ef]" aria-label="Skip tutorial"><X className="h-4 w-4" /></button>
        </div>
        <div className="tutorial-feature-preview mt-8 flex items-center gap-3 rounded-2xl border border-[#dce3ff] bg-[#eef1ff] p-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#2855ff] shadow-sm"><Icon className="h-6 w-6" /></div><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#2855ff]">Try this</p><p className="mt-1 text-xs font-semibold text-[#303a56]">{current.cue}</p></div></div>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[.16em] text-[#8a9087]">Step {step + 1} of {steps.length}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#111318]">{current.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#73766f]">{current.body}</p>
        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">{steps.map((item, index) => <span key={item.title} className={`h-1.5 rounded-full transition-all ${index === step ? 'w-7 bg-[#2855ff]' : 'w-1.5 bg-[#dfe2dc]'}`} />)}</div>
          <button type="button" onClick={() => isLast ? onFinish() : setStep((value) => value + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#111318] px-4 text-xs font-semibold text-white">{isLast ? <><Check className="h-4 w-4" /> Get started</> : <>Next <ArrowRight className="h-4 w-4" /></>}</button>
        </div>
      </div>
    </div>
  );
};