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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 p-2 bg-slate-900/90 border border-white/10 backdrop-blur-xl rounded-full shadow-2xl pointer-events-auto">
      <button
        onClick={onOpenShareModal}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
      >
        <Share2 className="w-4 h-4" />
        <span>Share Location</span>
      </button>

      <button
        onClick={onOpenPingModal}
        className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
      >
        <Zap className="w-4 h-4" />
        <span>Send Ping</span>
      </button>

      <button
        onClick={onOpenMemoryPinModal}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-full border border-white/10 transition-all hover:scale-105 active:scale-95"
      >
        <MapPin className="w-4 h-4 text-amber-400" />
        <span>Add Pin</span>
      </button>
    </div>
  );
};
