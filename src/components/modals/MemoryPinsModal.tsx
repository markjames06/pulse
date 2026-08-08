import React, { useState } from 'react';
import { X, Bookmark, MapPin, Sparkles } from 'lucide-react';
import { getRandomCoordsOffset } from '../../utils/formatters';

interface MemoryPinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  initialLat?: number;
  initialLng?: number;
  onSaveMemoryPin: (
    caption: string,
    emoji: string,
    lat: number,
    lng: number
  ) => Promise<void>;
}

export const MemoryPinsModal: React.FC<MemoryPinsModalProps> = ({
  isOpen,
  onClose,
  circleName,
  initialLat,
  initialLng,
  onSaveMemoryPin,
}) => {
  const [caption, setCaption] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('📍');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const emojiPresets = ['📍', '🏠', '☕', '❤️', '🏖️', '🍕', '🎉', '🚗'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setIsSubmitting(true);
    const coords = getRandomCoordsOffset(initialLat, initialLng);

    try {
      await onSaveMemoryPin(caption.trim(), emoji, coords.lat, coords.lng);
      setCaption('');
      setEmoji('📍');
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Error saving memory pin:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-white z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Save Memory Pin</h3>
              <p className="text-xs text-slate-400">
                Bookmark place for <span className="text-amber-400 font-semibold">{circleName}</span>
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
          {/* Emoji Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Pin Icon
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {emojiPresets.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-2xl text-lg flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Memory Caption / Place Name
            </label>
            <input
              type="text"
              placeholder="e.g. Favorite Coffee Shop, Sam's Apartment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={280}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Location Info */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {initialLat && initialLng
                ? `Pinned at coordinates (${initialLat.toFixed(4)}, ${initialLng.toFixed(4)})`
                : 'Pinned at your current map view location'}
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
              disabled={isSubmitting || !caption.trim()}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Memory Pin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
