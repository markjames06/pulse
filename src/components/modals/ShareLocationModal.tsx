import React, { useState } from 'react';
import { X, Clock, Radio, Shield, MapPin } from 'lucide-react';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  onStartShare: (
    durationMinutes: number,
    label?: string,
    lat?: number,
    lng?: number
  ) => Promise<void>;
}

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  isOpen,
  onClose,
  circleName,
  onStartShare,
}) => {
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [label, setLabel] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePresetDuration = (mins: number) => {
    setDurationMinutes(mins);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await onStartShare(
              durationMinutes,
              label.trim() || undefined,
              pos.coords.latitude,
              pos.coords.longitude
            );
            setIsSubmitting(false);
            onClose();
          },
          async () => {
            await onStartShare(durationMinutes, label.trim() || undefined);
            setIsSubmitting(false);
            onClose();
          },
          { timeout: 5000 }
        );
      } else {
        await onStartShare(durationMinutes, label.trim() || undefined);
        setIsSubmitting(false);
        onClose();
      }
    } catch (err) {
      console.error('Error starting location share:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-white z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Share Live Location</h3>
              <p className="text-xs text-slate-400">
                Visible only to trusted members in <span className="text-indigo-400 font-semibold">{circleName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Duration Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sharing Timer Duration</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '15m', mins: 15 },
                { label: '1 hour', mins: 60 },
                { label: '3 hours', mins: 180 },
                { label: '8 hours', mins: 480 },
              ].map((item) => (
                <button
                  type="button"
                  key={item.mins}
                  onClick={() => handlePresetDuration(item.mins)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    durationMinutes === item.mins
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Label */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Optional Activity Label</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Walking home, Driving to store..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-2 text-[11px] text-indigo-300">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Your location automatically stops sharing when the timer expires. You can stop sharing manually anytime.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Starting...</span>
              ) : (
                <>
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Start Sharing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
