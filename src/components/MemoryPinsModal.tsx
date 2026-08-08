import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, X, MapPin, Heart, Coffee, Home, Plane, Camera, Star, Utensils, Compass, Flag } from 'lucide-react';

interface MemoryPinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  initialLat?: number;
  initialLng?: number;
  onSaveMemoryPin: (caption: string, emoji: string, lat: number, lng: number) => Promise<void>;
}

const ICON_OPTIONS = [
  { id: 'bookmark', icon: Bookmark, label: 'Memory' },
  { id: 'heart', icon: Heart, label: 'Love' },
  { id: 'coffee', icon: Coffee, label: 'Cafe' },
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'plane', icon: Plane, label: 'Travel' },
  { id: 'camera', icon: Camera, label: 'Photo' },
  { id: 'star', icon: Star, label: 'Special' },
  { id: 'utensils', icon: Utensils, label: 'Dining' },
  { id: 'compass', icon: Compass, label: 'Explore' },
  { id: 'flag', icon: Flag, label: 'Landmark' },
];

export const MemoryPinsModal: React.FC<MemoryPinsModalProps> = ({
  isOpen,
  onClose,
  circleId,
  circleName,
  initialLat,
  initialLng,
  onSaveMemoryPin,
}) => {
  const [caption, setCaption] = useState<string>('');
  const [selectedIconId, setSelectedIconId] = useState<string>('bookmark');
  const [latitude, setLatitude] = useState<number>(initialLat || 14.599512);
  const [longitude, setLongitude] = useState<number>(initialLng || 120.984222);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      setLatitude(initialLat);
      setLongitude(initialLng);
    } else if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
      });
    }
  }, [initialLat, initialLng, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setIsSaving(true);
    try {
      await onSaveMemoryPin(caption.trim(), selectedIconId, latitude, longitude);
      setIsSaving(false);
      setCaption('');
      onClose();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Save Memory Pin</h3>
                <p className="text-xs text-slate-500">
                  Visible to members of <span className="text-amber-700 font-semibold">{circleName}</span>
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

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Icon Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Choose Category Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedIconId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIconId(item.id)}
                      title={item.label}
                      className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-2 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-gray-50 border border-gray-200 text-slate-600 hover:border-gray-300'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Memory Caption <span className="text-amber-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 'Where we had our first picnic date' or 'Favorite coffee spot'"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={280}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
              <div className="flex justify-end text-[10px] text-gray-400 mt-1">
                {caption.length}/280
              </div>
            </div>

            {/* Coordinates */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Pin Coordinates</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold">Lat:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-semibold">Lng:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg text-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving || !caption.trim()}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <span>Saving Memory Pin...</span>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Memory Spot</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
