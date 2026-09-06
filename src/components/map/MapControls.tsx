import React, { useState } from 'react';
import { Layers, LocateFixed, Eye, EyeOff, Radio, Bookmark, Sparkles, SlidersHorizontal, X } from 'lucide-react';

interface MapControlsProps {
  tileMode: 'dark' | 'street';
  onToggleTileMode: () => void;
  onLocateUser: () => void;
  markerVisibility: {
    activeShares: boolean;
    pings: boolean;
    memoryPins: boolean;
  };
  onToggleVisibility: (key: 'activeShares' | 'pings' | 'memoryPins') => void;
  counts: {
    shares: number;
    pings: number;
    memoryPins: number;
  };
}

export const MapControls: React.FC<MapControlsProps> = ({
  tileMode,
  onToggleTileMode,
  onLocateUser,
  markerVisibility,
  onToggleVisibility,
  counts,
}) => {
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  return (
    <div className="absolute top-3 right-3 md:top-5 md:right-5 z-[1000] flex flex-col gap-2 pointer-events-auto">
      {/* Map Tile Style Switcher */}
      <button
        onClick={onToggleTileMode}
        title="Toggle Map Style"
        className="w-11 h-11 bg-white hover:bg-zinc-50 text-zinc-800 rounded-[14px] border border-black/10 shadow-lg transition-all active:scale-95 flex items-center justify-center group"
      >
        <Layers className="w-5 h-5 text-zinc-700 md:group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Center Device Geolocation Button */}
      <button
        onClick={onLocateUser}
        title="Locate My Device"
        className="w-11 h-11 bg-white hover:bg-zinc-50 text-zinc-800 rounded-[14px] border border-black/10 shadow-lg transition-all active:scale-95 flex items-center justify-center group"
      >
        <LocateFixed className="w-5 h-5 text-zinc-700 md:group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Layer Filter Toggle */}
      <button
        onClick={() => setIsLayersOpen((open) => !open)}
        title="Show map layers"
        aria-label="Show map layers"
        aria-expanded={isLayersOpen}
        className={`w-11 h-11 bg-white hover:bg-zinc-50 text-zinc-800 rounded-[14px] border border-black/10 shadow-lg transition-all active:scale-95 flex items-center justify-center ${isLayersOpen ? 'bg-zinc-100' : ''}`}
      >
        {isLayersOpen ? <X className="w-5 h-5 text-zinc-700" /> : <SlidersHorizontal className="w-5 h-5 text-zinc-700" />}
      </button>

      {isLayersOpen && <div className="bg-white border border-black/10 rounded-[16px] p-1.5 shadow-lg flex flex-col gap-0.5 text-[11px]">
        <button
          onClick={() => onToggleVisibility('activeShares')}
          className={`flex items-center justify-between gap-2 px-3 py-2 max-sm:px-2 max-sm:w-9 max-sm:h-9 max-sm:justify-center rounded-xl font-medium transition-all ${
            markerVisibility.activeShares
              ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
              : 'text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-zinc-700" />
            <span className="max-sm:hidden">Shares ({counts.shares})</span>
          </div>
          {markerVisibility.activeShares ? (
            <Eye className="w-3.5 h-3.5 text-zinc-700" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        <button
          onClick={() => onToggleVisibility('pings')}
          className={`flex items-center justify-between gap-2 px-3 py-2 max-sm:px-2 max-sm:w-9 max-sm:h-9 max-sm:justify-center rounded-xl font-medium transition-all ${
            markerVisibility.pings
              ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
              : 'text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
            <span className="max-sm:hidden">Pings ({counts.pings})</span>
          </div>
          {markerVisibility.pings ? (
            <Eye className="w-3.5 h-3.5 text-zinc-700" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        <button
          onClick={() => onToggleVisibility('memoryPins')}
          className={`flex items-center justify-between gap-2 px-3 py-2 max-sm:px-2 max-sm:w-9 max-sm:h-9 max-sm:justify-center rounded-xl font-medium transition-all ${
            markerVisibility.memoryPins
              ? 'bg-zinc-100 text-zinc-900 border border-zinc-200'
              : 'text-zinc-400 hover:text-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-zinc-700" />
            <span className="max-sm:hidden">Pins ({counts.memoryPins})</span>
          </div>
          {markerVisibility.memoryPins ? (
            <Eye className="w-3.5 h-3.5 text-zinc-700" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>
      </div>}
    </div>
  );
};
