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
    <div className="pulse-content max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Header Banner */}
      <div className="pulse-header flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Activity / Updates</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Circle pings</h2>
          <p className="text-sm text-slate-500 max-w-xl">
            Quick updates and check-ins from <span className="font-semibold text-slate-700">{circleName}</span>.
          </p>
        </div>

        <button
          onClick={onOpenPingModal}
          className="ui-primary-button flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-all md:hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Send Quick Ping</span>
        </button>
      </div>

      {/* Pings Feed */}
      <div className="space-y-3">
        {pings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center mx-auto mb-3">
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
                className="pulse-card p-4 bg-white border border-gray-200 rounded-xl flex items-start gap-4 hover:border-gray-300 transition-all"
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
                    <h4 className="font-semibold text-sm text-slate-900 truncate">
                      {ping.senderProfile?.displayName || 'Circle Member'}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {formatTimeAgo(ping.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 mt-2 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    "{ping.message}"
                  </p>

                  {ping.latitude !== undefined && ping.longitude !== undefined && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Location shared from the map</span>
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
