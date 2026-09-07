import React from 'react';
import { MemoryPin } from '../../types';
import { Bookmark, Plus, Trash2, MapPin } from 'lucide-react';
import { formatTimeAgo, getInitials } from '../../utils/formatters';
import { getMemoryPinIconSvg } from '../map/mapUtils';

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
    <div className="pulse-content max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Top Banner */}
      <div className="pulse-header flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Library / Saved places</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Memory pins</h2>
          <p className="text-sm text-slate-500 max-w-xl">
            Saved places and important spots for <span className="font-semibold text-slate-700">{circleName}</span>.
          </p>
        </div>

        <button
          onClick={onOpenMemoryPinModal}
          className="ui-primary-button flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-all md:hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Save Memory Pin</span>
        </button>
      </div>

      {/* Pins Grid */}
      {memoryPins.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center mx-auto mb-3">
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
                className="pulse-card p-4 bg-white border border-gray-200 rounded-xl flex flex-col justify-between hover:border-gray-300 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
                        <span dangerouslySetInnerHTML={{ __html: getMemoryPinIconSvg(pin.emoji) }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 leading-tight">
                          {pin.caption}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {pin.placeName || formatTimeAgo(pin.createdAt)}
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
