import React from 'react';
import { Ping } from '../../types';
import { Zap, Send, MapPin } from 'lucide-react';
import { formatTimeAgo, getInitials } from '../../utils/formatters';

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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Circle Pings</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Quick status updates, check-ins, or emergency alerts in <span className="font-bold text-slate-800">{circleName}</span>.
          </p>
        </div>

        <button
          onClick={onOpenPingModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Send Quick Ping</span>
        </button>
      </div>

      {/* Pings Feed */}
      <div className="space-y-3">
        {pings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">No Pings Sent Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Send a instant ping to notify everyone in your circle with a message or live location.
            </p>
          </div>
        ) : (
          pings.map((ping: Ping) => {
            const initials = getInitials(ping.senderProfile?.displayName);

            return (
              <div
                key={ping.id}
                className="p-5 bg-white border border-gray-200 rounded-3xl shadow-xs flex items-start gap-4 hover:border-gray-300 transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${
                    ping.senderProfile?.avatarColor || 'bg-rose-600'
                  } text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-md`}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {ping.senderProfile?.displayName || 'Circle Member'}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {formatTimeAgo(ping.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100 font-medium">
                    "{ping.message}"
                  </p>

                  {ping.latitude !== undefined && ping.longitude !== undefined && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Attached GPS Location ({ping.latitude.toFixed(4)}, {ping.longitude.toFixed(4)})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
