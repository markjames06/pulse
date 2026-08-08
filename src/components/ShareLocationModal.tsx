import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, Share2, Shield, X, Sparkles, Navigation } from 'lucide-react';

interface ShareLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  onStartShare: (durationMinutes: number, label?: string, lat?: number, lng?: number) => Promise<void>;
}

const DURATION_PRESETS = [
  { label: '15 Minutes', minutes: 15, sub: 'Quick check-in' },
  { label: '30 Minutes', minutes: 30, sub: 'Short commute' },
  { label: '1 Hour', minutes: 60, sub: 'Dinner or workout' },
  { label: '2 Hours', minutes: 120, sub: 'Longer trip' },
];

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  isOpen,
  onClose,
  circleId,
  circleName,
  onStartShare,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customLabel, setCustomLabel] = useState<string>('');
  const [useCustomLocation, setUseCustomLocation] = useState<boolean>(false);
  const [customLat, setCustomLat] = useState<number>(14.599512);
  const [customLng, setCustomLng] = useState<number>(120.984222);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomLat(Number(pos.coords.latitude.toFixed(6)));
          setCustomLng(Number(pos.coords.longitude.toFixed(6)));
        },
        (err) => console.log('Geolocation notice:', err.message)
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (navigator.geolocation && !useCustomLocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await onStartShare(
              selectedMinutes,
              customLabel,
              pos.coords.latitude,
              pos.coords.longitude
            );
            setIsSubmitting(false);
            onClose();
          },
          async () => {
            // Fallback location if geolocation is blocked/denied
            await onStartShare(selectedMinutes, customLabel, customLat, customLng);
            setIsSubmitting(false);
            onClose();
          }
        );
      } else {
        await onStartShare(selectedMinutes, customLabel, customLat, customLng);
        setIsSubmitting(false);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Start Location Share</h3>
                <p className="text-xs text-slate-500">
                  Sharing with <span className="text-rose-600 font-semibold">{circleName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-slate-800 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Privacy Shield Banner */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-800 space-y-0.5">
                <span className="font-semibold text-emerald-700">Consent-First Security:</span>
                <p className="text-slate-600">
                  Your location will strictly auto-expire when the timer finishes. No continuous tracking.
                </p>
              </div>
            </div>

            {/* Duration Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                Select Share Duration <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {DURATION_PRESETS.map((preset) => {
                  const isSelected = selectedMinutes === preset.minutes;
                  return (
                    <button
                      key={preset.minutes}
                      type="button"
                      onClick={() => setSelectedMinutes(preset.minutes)}
                      className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/20'
                          : 'bg-gray-50/50 border-gray-200 text-slate-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold">{preset.label}</span>
                        <Clock
                          className={`w-4 h-4 ${isSelected ? 'text-rose-600' : 'text-gray-400'}`}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 mt-1">{preset.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Label / Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Optional Status or Destination
              </label>
              <input
                type="text"
                placeholder="e.g. 'Until I get home' or 'At grocery store'"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Simulation Location Toggle (For easy preview testing) */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-700">Simulate Location Coords</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseCustomLocation(!useCustomLocation)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    useCustomLocation ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      useCustomLocation ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {useCustomLocation && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold">Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={customLat}
                      onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold">Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={customLng}
                      onChange={(e) => setCustomLng(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Starting Time-boxed Share...</span>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Start Sharing for {selectedMinutes} Minutes</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
