import React from 'react';
import { Layers, LocateFixed, Eye, EyeOff, Radio, Bookmark, Sparkles } from 'lucide-react';

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
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
      {/* Map Tile Style Switcher */}
      <button
        onClick={onToggleTileMode}
        title="Toggle Map Style"
        className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl border border-white/10 backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
      >
        <Layers className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Center Device Geolocation Button */}
      <button
        onClick={onLocateUser}
        title="Locate My Device"
        className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl border border-white/10 backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
      >
        <LocateFixed className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
      </button>

      {/* Layer Filter Toggles Container */}
      <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-2xl p-2 shadow-xl flex flex-col gap-1 text-xs">
        <button
          onClick={() => onToggleVisibility('activeShares')}
          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
            markerVisibility.activeShares
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <span>Shares ({counts.shares})</span>
          </div>
          {markerVisibility.activeShares ? (
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        <button
          onClick={() => onToggleVisibility('pings')}
          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
            markerVisibility.pings
              ? 'bg-rose-600/30 text-rose-200 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Pings ({counts.pings})</span>
          </div>
          {markerVisibility.pings ? (
            <Eye className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        <button
          onClick={() => onToggleVisibility('memoryPins')}
          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
            markerVisibility.memoryPins
              ? 'bg-amber-600/30 text-amber-200 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Pins ({counts.memoryPins})</span>
          </div>
          {markerVisibility.memoryPins ? (
            <Eye className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>
    </div>
  );
};
