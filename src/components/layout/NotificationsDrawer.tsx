import React from 'react';
import { NotificationItem } from '../../types';
import { X, Bell, Radio, Zap, Bookmark, UserPlus } from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'share_started':
      case 'share_stopped':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      case 'ping_received':
        return <Zap className="w-4 h-4 text-rose-400" />;
      case 'memory_pin_added':
        return <Bookmark className="w-4 h-4 text-amber-400" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-white/10 text-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-bold text-base text-slate-100">Activity Notifications</h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No recent circle activity
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-white/5 hover:border-white/10 transition-all flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-white/10 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-slate-200">{n.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
