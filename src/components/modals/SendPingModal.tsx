import React, { useState } from 'react';
import { X, Zap, Send, MapPin, Crosshair } from 'lucide-react';

interface SendPingModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  onSendPing: (message: string, attachLocation: boolean, lat?: number, lng?: number) => Promise<void>;
  onEnterMapSelectionMode: () => void;
}

type LocationMode = 'current' | 'custom';

export const SendPingModal: React.FC<SendPingModalProps> = ({
  isOpen,
  onClose,
  circleName,
  onSendPing,
  onEnterMapSelectionMode,
}) => {
  const [message, setMessage] = useState<string>('');
  const [locationMode, setLocationMode] = useState<LocationMode>('current');
  const [customLat, setCustomLat] = useState<number | undefined>();
  const [customLng, setCustomLng] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset custom location when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCustomLat(undefined);
      setCustomLng(undefined);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickMessages = [
    'Arrived safely!',
    'Heading home now',
    'Running 10 mins late',
    'Please check in!',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;

      if (locationMode === 'current') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await onSendPing(message.trim(), true, pos.coords.latitude, pos.coords.longitude);
              setMessage('');
              setIsSubmitting(false);
              onClose();
            },
            async () => {
              await onSendPing(message.trim(), false);
              setMessage('');
              setIsSubmitting(false);
              onClose();
            },
            { timeout: 5000 }
          );
          return;
        }
      } else if (locationMode === 'custom') {
        lat = customLat;
        lng = customLng;
      }

      await onSendPing(message.trim(), locationMode === 'custom' ? (lat !== undefined && lng !== undefined) : true, lat, lng);
      setMessage('');
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Error sending ping:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      <div className="pulse-modal relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-white z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Send Circle Ping</h3>
              <p className="text-xs text-slate-400">
                Notify members in <span className="text-rose-400 font-semibold">{circleName}</span>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickMessages.map((msg) => (
                <button
                  type="button"
                  key={msg}
                  onClick={() => setMessage(msg)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-white/5 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Message Payload
            </label>
            <textarea
              rows={3}
              placeholder="Type custom status or check-in note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 resize-none"
            />
          </div>

          {/* Location Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Location Attachment
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocationMode('current')}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  locationMode === 'current'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/50'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>Current GPS</span>
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('custom')}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  locationMode === 'custom'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400/50'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Custom Location</span>
              </button>
            </div>
          </div>

          {/* Custom Location Info */}
          {locationMode === 'custom' && (
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                {customLat !== undefined && customLng !== undefined
                  ? `Selected: ${customLat.toFixed(4)}, ${customLng.toFixed(4)}`
                  : 'Click "Select on Map" to choose location'}
              </span>
            </div>
          )}

          {/* Map Selection Button */}
          {locationMode === 'custom' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEnterMapSelectionMode();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Select on Map</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="ui-secondary-button flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="ui-primary-button flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Ping</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
