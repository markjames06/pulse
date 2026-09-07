import React, { useState } from 'react';
import { Layers, LocateFixed, Eye, EyeOff, Radio, Bookmark, Sparkles, SlidersHorizontal, X } from 'lucide-react';

interface MapControlsProps {
  tileMode: 'auto' | 'street' | 'satellite';
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
  const tileModeLabel = tileMode === 'satellite' ? 'Satellite' : tileMode === 'street' ? 'Street' : 'Auto';

  return (
    <div className="map-controls absolute top-3 right-3 md:top-5 md:right-5 z-[1000] flex flex-col gap-2 pointer-events-auto">
      {/* Map Tile Style Switcher */}
      <button
        onClick={onToggleTileMode}
        title={`Map style: ${tileModeLabel}. Select for next style.`}
        aria-label={`Map style: ${tileModeLabel}. Select for next style.`}
        className="map-control-button w-11 h-11 bg-white hover:bg-zinc-50 text-zinc-800 rounded-[14px] border border-black/10 shadow-lg transition-all active:scale-95 flex items-center justify-center group"
      >
        <Layers className="w-5 h-5 text-zinc-700 md:group-hover:-translate-y-0.5 transition-transform" />
        <span className="sr-only">{tileModeLabel}</span>
      </button>

      {/* Center Device Geolocation Button */}
      <button
        onClick={onLocateUser}
        title="Locate My Device"
        className="map-control-button w-11 h-11 bg-white hover:bg-zinc-50 text-zinc-800 rounded-[14px] border border-black/10 shadow-lg transition-all active:scale-95 flex items-center justify-center group"
      >
        <LocateFixed className="w-5 h-5 text-zinc-700 md:group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Layer Filter Toggle */}
      <button
        onClick={() => setIsLayersOpen((open) => !open)}
        title="Show map layers"
        aria-label="Show map layers"
        aria-expanded={isLayersOpen}
        className={`map-control-button w-11 h-11 bg-white hover:bg-zinc-50 text-zinc-800 rounded-[14px] border border-black/10 shadow-lg transition-all active:scale-95 flex items-center justify-center ${isLayersOpen ? 'bg-zinc-100' : ''}`}
      >
        {isLayersOpen ? <X className="w-5 h-5 text-zinc-700" /> : <SlidersHorizontal className="w-5 h-5 text-zinc-700" />}
      </button>

      {isLayersOpen && (
        <div className="map-layer-panel bg-white/95 backdrop-blur-md border border-black/10 rounded-[18px] p-2 shadow-2xl flex flex-col gap-1 text-[11px] min-w-[150px]">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-0.5">
            Map Layers
          </div>
          <button
            type="button"
            onClick={() => onToggleVisibility('activeShares')}
            className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl font-semibold transition-all ${
              markerVisibility.activeShares
                ? 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
              <span>Shares ({counts.shares})</span>
            </div>
            {markerVisibility.activeShares ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onToggleVisibility('pings')}
            className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl font-semibold transition-all ${
              markerVisibility.pings
                ? 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
              <span>Pings ({counts.pings})</span>
            </div>
            {markerVisibility.pings ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onToggleVisibility('memoryPins')}
            className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl font-semibold transition-all ${
              markerVisibility.memoryPins
                ? 'bg-zinc-100 text-zinc-900 border border-zinc-200/80 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Pins ({counts.memoryPins})</span>
            </div>
            {markerVisibility.memoryPins ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
