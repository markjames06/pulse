import React from 'react';
import { Ping } from '../types';
import { Zap, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

interface PingsListProps {
  pings: Ping[];
  onOpenPingModal: () => void;
  circleName: string;
}

export const PingsList: React.FC<PingsListProps> = ({
  pings,
  onOpenPingModal,
  circleName,
}) => {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Quick Pings</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            One-time status updates & moments in <span className="text-indigo-600 font-semibold">{circleName}</span>
          </p>
        </div>

        <button
          onClick={onOpenPingModal}
          className="flex items-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>Send Ping</span>
        </button>
      </div>

      {/* Pings Feed */}
      {pings.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-3xl space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No pings sent yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Send a quick "On my way!", "Landed safely", or "Heading home" ping to let your circle know.
          </p>
          <button
            onClick={onOpenPingModal}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200 transition-colors"
          >
            Send First Ping
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pings.map((ping) => {
            const initials =
              ping.senderProfile?.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'U';

            const timeStr = new Date(ping.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateStr = new Date(ping.createdAt).toLocaleDateString();

            return (
              <div
                key={ping.id}
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div
                  className={`w-10 h-10 rounded-2xl ${
                    ping.senderProfile?.avatarColor || 'bg-indigo-600'
                  } text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs`}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {ping.senderProfile?.displayName}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 font-semibold">
                      {dateStr} • {timeStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 mt-1.5 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {ping.message}
                  </p>

                  {ping.latitude && ping.longitude && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold">
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      <span>Attached Location ({ping.latitude.toFixed(3)}, {ping.longitude.toFixed(3)})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
