import React from 'react';
import { Share2, Zap, MapPin } from 'lucide-react';

interface MapOverlayActionsProps {
  onOpenShareModal: () => void;
  onOpenPingModal: () => void;
  onOpenMemoryPinModal: () => void;
}

export const MapOverlayActions: React.FC<MapOverlayActionsProps> = ({
  onOpenShareModal,
  onOpenPingModal,
  onOpenMemoryPinModal,
}) => {
  return (
    <div className="map-action-bar absolute bottom-[5.25rem] left-3 right-3 max-w-sm mx-auto md:bottom-6 md:right-6 md:left-auto md:mx-0 md:max-w-none z-[1000] flex items-center justify-between gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-black/10 rounded-[20px] shadow-2xl">
      <button
        type="button"
        onClick={onOpenShareModal}
        className="ui-primary-button flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-[14px] transition-all active:scale-[0.97] shadow-sm"
      >
        <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Share</span>
      </button>
      <button
        type="button"
        onClick={onOpenPingModal}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 text-xs font-semibold rounded-[14px] transition-all active:scale-[0.97]"
        aria-label="Send ping"
      >
        <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0" />
        <span>Ping</span>
      </button>
      <button
        type="button"
        onClick={onOpenMemoryPinModal}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 text-xs font-semibold rounded-[14px] transition-all active:scale-[0.97]"
        aria-label="Add memory pin"
      >
        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
        <span>Pin</span>
      </button>
    </div>
  );
};
