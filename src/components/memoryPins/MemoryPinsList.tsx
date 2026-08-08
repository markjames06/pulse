import React from 'react';
import { MemoryPin } from '../../types';
import { Bookmark, Plus, Trash2, MapPin } from 'lucide-react';
import { formatTimeAgo, getInitials } from '../../utils/formatters';

interface MemoryPinsListProps {
  memoryPins: MemoryPin[];
  currentUserId: string;
  circleName: string;
  onOpenMemoryPinModal: () => void;
  onDeleteMemoryPin: (pinId: string) => void;
  onFocusPinOnMap: (pin: MemoryPin) => void;
}

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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Memory Pins</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Saved spots, memorable dates, or favorite meetups in <span className="font-bold text-slate-800">{circleName}</span>.
          </p>
        </div>

        <button
          onClick={onOpenMemoryPinModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Save Memory Pin</span>
        </button>
      </div>

      {/* Pins Grid */}
      {memoryPins.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">No Saved Memory Pins</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click on the map or tap the button above to bookmark special places for your circle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {memoryPins.map((pin) => {
            const isCreator = pin.createdBy === currentUserId;
            const initials = getInitials(pin.creatorProfile?.displayName);

            return (
              <div
                key={pin.id}
                className="p-5 bg-white border border-gray-200 rounded-3xl shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 text-2xl flex items-center justify-center shrink-0 shadow-xs">
                        {pin.emoji || '📍'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {pin.caption}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatTimeAgo(pin.createdAt)}
                        </span>
                      </div>
                    </div>

                    {isCreator && (
                      <button
                        onClick={() => onDeleteMemoryPin(pin.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Pin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full ${
                        pin.creatorProfile?.avatarColor || 'bg-amber-600'
                      } text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {initials}
                    </div>
                    <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                      {pin.creatorProfile?.displayName || 'Member'}
                    </span>
                  </div>

                  <button
                    onClick={() => onFocusPinOnMap(pin)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
