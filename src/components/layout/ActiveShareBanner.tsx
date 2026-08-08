import React, { useState, useEffect } from 'react';
import { LocationShare } from '../../types';
import { Radio, StopCircle, Clock, ShieldCheck } from 'lucide-react';

interface ActiveShareBannerProps {
  activeShare: LocationShare;
  onStopShare: (shareId: string) => void;
}

export const ActiveShareBanner: React.FC<ActiveShareBannerProps> = ({
  activeShare,
  onStopShare,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const expires = new Date(activeShare.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeShare.expiresAt]);

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/30 px-4 py-2.5 shadow-xl text-white z-[1050] relative animate-in fade-in slide-in-from-top-1">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-100 truncate">
              You are actively sharing live location
            </span>
            {activeShare.label && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium text-[11px] truncate">
                🏷️ {activeShare.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-200 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{timeLeft}</span>
          </div>

          <button
            onClick={() => onStopShare(activeShare.id)}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600/90 hover:bg-rose-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 text-xs"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Stop Sharing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
