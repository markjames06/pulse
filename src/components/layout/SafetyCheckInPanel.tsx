import React, { useEffect, useState } from 'react';
import { ShieldCheck, Timer, Check } from 'lucide-react';
import { SafetyCheckIn } from '../../types';
import { formatTimeAgo } from '../../utils/formatters';

interface SafetyCheckInPanelProps {
  checkIns: SafetyCheckIn[];
  currentUserId: string;
  ownCheckIn?: SafetyCheckIn;
  onStart: (durationMinutes: number) => Promise<void>;
  onComplete: (checkInId: string) => Promise<void>;
}

export const SafetyCheckInPanel: React.FC<SafetyCheckInPanelProps> = ({
  checkIns,
  currentUserId,
  ownCheckIn,
  onStart,
  onComplete,
}) => {
  const [remaining, setRemaining] = useState('');
  const [busy, setBusy] = useState(false);
  const activeCheckIns = checkIns.filter((checkIn) => checkIn.status === 'active');

  useEffect(() => {
    if (!ownCheckIn) return undefined;
    const update = () => {
      const seconds = Math.max(0, Math.floor((new Date(ownCheckIn.expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(`${Math.floor(seconds / 60)}m ${seconds % 60}s left`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [ownCheckIn?.expiresAt]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); } finally { setBusy(false); }
  };

  return (
    <section className="safety-panel absolute bottom-24 left-3 right-3 md:bottom-6 md:left-28 md:right-auto z-[1000] max-w-sm rounded-2xl bg-white/95 border border-black/10 shadow-xl p-3 backdrop-blur-sm">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-bold text-zinc-900">Safety check-in</h2>
          {ownCheckIn ? (
            <>
              <p className="text-[11px] text-zinc-500 mt-0.5">Your circle knows you are checking in. {remaining}</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => onComplete(ownCheckIn.id))}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> I'm safe
              </button>
            </>
          ) : (
            <>
              <p className="text-[11px] text-zinc-500 mt-0.5">Set a timer and confirm you are safe before it ends.</p>
              <div className="flex gap-1.5 mt-2">
                {[30, 120].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    disabled={busy}
                    onClick={() => void run(() => onStart(minutes))}
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                  >
                    <Timer className="w-3 h-3" /> {minutes === 30 ? '30 min' : '2 hours'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {activeCheckIns.some((checkIn) => checkIn.userId !== currentUserId) && (
        <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] text-zinc-500">
          {activeCheckIns.filter((checkIn) => checkIn.userId !== currentUserId).map((checkIn) =>
            `${checkIn.userProfile?.displayName || 'A circle member'} is checking in until ${formatTimeAgo(checkIn.expiresAt)}`
          ).join(' • ')}
        </p>
      )}
    </section>
  );
};
