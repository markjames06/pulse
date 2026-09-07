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
    <div className="map-action-bar absolute bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:translate-x-0 z-[1000] flex items-center gap-1 p-1.5 bg-white border border-black/10 rounded-[18px] shadow-xl md:w-auto">
      <button
        type="button"
        onClick={onOpenShareModal}
        className="ui-primary-button flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-[13px]"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>
      <button
        type="button"
        onClick={onOpenPingModal}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-3 text-zinc-800 text-xs font-medium rounded-[13px] hover:bg-zinc-100"
        aria-label="Send ping"
      >
        <Zap className="w-4 h-4" />
        <span>Ping</span>
      </button>
      <button
        type="button"
        onClick={onOpenMemoryPinModal}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-3 text-zinc-800 text-xs font-medium rounded-[13px] hover:bg-zinc-100"
        aria-label="Add memory pin"
      >
        <MapPin className="w-4 h-4" />
        <span>Pin</span>
      </button>
    </div>
  );
};
