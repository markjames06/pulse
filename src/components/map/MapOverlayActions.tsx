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
    <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1 p-1.5 bg-white/90 border border-black/8 backdrop-blur-xl rounded-full shadow-xl max-w-[calc(100%-1.5rem)]">
      <button
        type="button"
        onClick={onOpenShareModal}
        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-full"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden xs:inline sm:inline">Share</span>
      </button>
      <button
        type="button"
        onClick={onOpenPingModal}
        className="flex items-center gap-2 px-3 py-2.5 text-zinc-800 text-xs font-medium rounded-full hover:bg-zinc-100"
        aria-label="Send ping"
      >
        <Zap className="w-4 h-4" />
        <span className="hidden sm:inline">Ping</span>
      </button>
      <button
        type="button"
        onClick={onOpenMemoryPinModal}
        className="flex items-center gap-2 px-3 py-2.5 text-zinc-800 text-xs font-medium rounded-full hover:bg-zinc-100"
        aria-label="Add memory pin"
      >
        <MapPin className="w-4 h-4" />
        <span className="hidden sm:inline">Pin</span>
      </button>
    </div>
  );
};
