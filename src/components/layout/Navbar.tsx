import React, { useState, useRef, useEffect } from 'react';
import { Circle, UserProfile } from '../../types';
import {
  Map,
  Users,
  Zap,
  Bookmark,
  Bell,
  Settings,
  ChevronDown,
  Radio,
  Check,
  CalendarDays,
  CreditCard,
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';

interface NavbarProps {
  activeTab: 'map' | 'circles' | 'pings' | 'memory_pins' | 'moments' | 'plans';
  setActiveTab: (tab: 'map' | 'circles' | 'pings' | 'memory_pins' | 'moments' | 'plans') => void;
  circles: Circle[];
  activeCircleId: string;
  onSelectCircle: (id: string) => void;
  currentUser?: UserProfile | null;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  realtimeStatus: 'connecting' | 'live' | 'reconnecting';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  circles,
  activeCircleId,
  onSelectCircle,
  currentUser,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSettings,
  realtimeStatus,
}) => {
  const [isCircleDropdownOpen, setIsCircleDropdownOpen] = useState(false);
  const circleDropdownRef = useRef<HTMLDivElement>(null);
  const activeCircle = circles.find((circle) => circle.id === activeCircleId) || circles[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (circleDropdownRef.current && !circleDropdownRef.current.contains(event.target as Node)) {
        setIsCircleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'map' as const, label: 'Map', icon: Map },
    { id: 'circles' as const, label: 'Circles', icon: Users },
    { id: 'pings' as const, label: 'Pings', icon: Zap },
    { id: 'memory_pins' as const, label: 'Pins', icon: Bookmark },
    { id: 'moments' as const, label: 'Plans', icon: CalendarDays },
    { id: 'plans' as const, label: 'Upgrade', icon: CreditCard },
  ];

  return (
    <>
      <header className="pulse-navbar sticky top-0 z-[1100] md:fixed md:inset-y-0 md:left-0 md:w-[5.5rem] md:border-r md:border-b-0 bg-[#f7f7f4] border-b border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-4 h-[4.25rem] md:h-full md:px-2 md:py-5 md:flex-col md:justify-start flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <span className="w-10 h-10 rounded-[14px] bg-[#111318] text-white flex items-center justify-center md:group-hover:scale-105 transition-transform">
                <Radio className="w-4 h-4 text-sky-300" />
              </span>
              <span className="font-semibold tracking-[-0.02em] text-zinc-900 md:hidden">Pulse</span>
            </button>
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-500"
              title={`Live updates: ${realtimeStatus}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'live' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {realtimeStatus === 'live' ? 'Live' : 'Reconnecting'}
            </span>

            <div className="relative hidden sm:block md:hidden" ref={circleDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCircleDropdownOpen((open) => !open)}
                className="pulse-circle-switcher flex items-center gap-2 max-w-[180px] px-3.5 py-2 rounded-full bg-white/70 border border-black/[0.07] shadow-sm text-xs font-medium text-zinc-700 hover:bg-white transition-colors"
              >
                <span className="truncate">{activeCircle?.name || 'No circle'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 ${isCircleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCircleDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white border border-black/8 shadow-xl p-1.5 z-50">
                  {circles.length === 0 && (
                    <p className="px-3 py-2 text-xs text-zinc-500">Create a circle to start.</p>
                  )}
                  {circles.map((circle) => (
                    <button
                      key={circle.id}
                      type="button"
                      onClick={() => {
                        onSelectCircle(circle.id);
                        setIsCircleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                        circle.id === activeCircleId
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="truncate">{circle.name}</span>
                      {circle.id === activeCircleId && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="hidden md:flex md:flex-col items-center gap-2 p-0 md:mt-auto md:mb-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-2 py-2.5 rounded-[13px] text-xs font-medium transition-all md:flex-col md:w-[4.5rem] ${
                    active ? 'bg-[#111318] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 md:flex-col md:mt-auto">
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative w-11 h-11 md:w-9 md:h-9 rounded-full bg-white/70 border border-black/[0.07] shadow-sm text-zinc-700 flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-11 h-11 md:w-9 md:h-9 rounded-full bg-white/70 border border-black/[0.07] shadow-sm text-zinc-700 flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className={`w-11 h-11 md:w-9 md:h-9 rounded-full ${currentUser?.avatarColor || 'bg-zinc-800'} text-white text-[11px] font-semibold flex items-center justify-center`}
              aria-label="Account"
            >
              {getInitials(currentUser?.displayName)}
            </button>
          </div>
        </div>
      </header>

      <nav className="pulse-mobile-nav md:hidden fixed bottom-0 inset-x-0 z-[1100] bg-[#f7f7f4] border-t border-black/[0.08] pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-[4.5rem] gap-1 overflow-x-auto px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-[16.66%] flex-col items-center justify-center gap-1.5 my-1 rounded-[14px] text-[10px] font-medium transition-colors ${
                  active ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
