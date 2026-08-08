import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem } from '../types';
import { Bell, X, Share2, Zap, Bookmark, UserPlus, CheckCircle2 } from 'lucide-react';

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
        return <Share2 className="w-4 h-4 text-rose-600" />;
      case 'ping_received':
        return <Zap className="w-4 h-4 text-indigo-600" />;
      case 'memory_pin_added':
        return <Bookmark className="w-4 h-4 text-amber-600" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white border-l border-gray-200 p-6 flex flex-col justify-between shadow-2xl"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Activity & Activity Feed</h3>
                  <p className="text-xs text-slate-500 font-medium">Notifications in your trusted circle</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-slate-800 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)] pr-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-medium">
                  No activity notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-start gap-3 hover:border-gray-300 transition-colors"
                  >
                    <div className="p-2 bg-white rounded-xl border border-gray-200 shrink-0 shadow-2xs">
                      {getIcon(notif.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{notif.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{notif.body}</div>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono font-medium">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <span className="text-[11px] text-gray-400 font-medium">
              Web Push API Notifications Active
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
