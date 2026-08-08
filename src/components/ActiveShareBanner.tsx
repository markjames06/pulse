import React, { useState, useEffect } from 'react';
import { LocationShare } from '../types';
import { Clock, StopCircle, Radio, Shield, AlertCircle } from 'lucide-react';

interface ActiveShareBannerProps {
  activeShare: LocationShare;
  onStopShare: (shareId: string) => Promise<void>;
}

export const ActiveShareBanner: React.FC<ActiveShareBannerProps> = ({
  activeShare,
  onStopShare,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isStopping, setIsStopping] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = () => {
      const diffMs = new Date(activeShare.expiresAt).getTime() - new Date().getTime();
      if (diffMs <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const totalSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeShare.expiresAt]);

  const handleStop = async () => {
    setIsStopping(true);
    try {
      await onStopShare(activeShare.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[calc(100%-2rem)] bg-white/95 border border-rose-200 backdrop-blur-xl rounded-2xl shadow-xl p-3 flex items-center justify-between gap-3 text-slate-800">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500 text-white font-bold shrink-0 shadow-md shadow-rose-500/20">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Active Time-Boxed Share</span>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
              Live GPS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
            {activeShare.label && <span className="truncate max-w-[150px] italic">"{activeShare.label}"</span>}
            <span className="flex items-center gap-1 font-mono font-bold text-slate-900">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleStop}
        disabled={isStopping}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all shrink-0"
      >
        <StopCircle className="w-4 h-4" />
        <span>{isStopping ? 'Stopping...' : 'Stop Sharing'}</span>
      </button>
    </div>
  );
};
