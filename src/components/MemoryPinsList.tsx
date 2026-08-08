import React from 'react';
import { MemoryPin } from '../types';
import { Bookmark, MapPin, Trash2, Plus, Heart, Coffee, Home, Plane, Camera, Star, Utensils, Compass, Flag } from 'lucide-react';

interface MemoryPinsListProps {
  memoryPins: MemoryPin[];
  currentUserId: string;
  circleName: string;
  onOpenMemoryPinModal: () => void;
  onDeleteMemoryPin: (pinId: string) => Promise<void>;
  onFocusPinOnMap?: (pin: MemoryPin) => void;
}

const getPinIcon = (iconId?: string) => {
  switch (iconId) {
    case 'heart':
      return <Heart className="w-5 h-5 text-amber-700" />;
    case 'coffee':
      return <Coffee className="w-5 h-5 text-amber-700" />;
    case 'home':
      return <Home className="w-5 h-5 text-amber-700" />;
    case 'plane':
      return <Plane className="w-5 h-5 text-amber-700" />;
    case 'camera':
      return <Camera className="w-5 h-5 text-amber-700" />;
    case 'star':
      return <Star className="w-5 h-5 text-amber-700" />;
    case 'utensils':
      return <Utensils className="w-5 h-5 text-amber-700" />;
    case 'compass':
      return <Compass className="w-5 h-5 text-amber-700" />;
    case 'flag':
      return <Flag className="w-5 h-5 text-amber-700" />;
    default:
      return <Bookmark className="w-5 h-5 text-amber-700" />;
  }
};

export const MemoryPinsList: React.FC<MemoryPinsListProps> = ({
  memoryPins,
  currentUserId,
  circleName,
  onOpenMemoryPinModal,
  onDeleteMemoryPin,
  onFocusPinOnMap,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Memory Pins</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Permanent memorable spots saved in <span className="text-amber-700 font-semibold">{circleName}</span>
          </p>
        </div>

        <button
          onClick={onOpenMemoryPinModal}
          className="flex items-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-2xl shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Save Spot</span>
        </button>
      </div>

      {/* Grid of Pins */}
      {memoryPins.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-3xl space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No memory pins saved yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Save special spots like first dates, favorite coffee shops, or family homes.
          </p>
          <button
            onClick={onOpenMemoryPinModal}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-xl border border-amber-200 transition-colors cursor-pointer"
          >
            Save First Spot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memoryPins.map((pin) => {
            const isCreator = pin.createdBy === currentUserId;
            const dateStr = new Date(pin.createdAt).toLocaleDateString();

            return (
              <div
                key={pin.id}
                className="p-5 bg-white border border-gray-200 rounded-3xl hover:border-gray-300 transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shadow-xs">
                        {getPinIcon(pin.emoji)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Saved Spot
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          By {pin.creatorProfile?.displayName || 'Circle Member'}
                        </span>
                      </div>
                    </div>

                    {isCreator && (
                      <button
                        onClick={() => onDeleteMemoryPin(pin.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Pin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 bg-gray-50 p-3 rounded-2xl border border-gray-100 leading-relaxed font-medium">
                    "{pin.caption}"
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-1 font-mono text-[10px] text-gray-500 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {pin.latitude.toFixed(3)}, {pin.longitude.toFixed(3)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-medium">{dateStr}</span>
                    {onFocusPinOnMap && (
                      <button
                        onClick={() => onFocusPinOnMap(pin)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        View on Map
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
