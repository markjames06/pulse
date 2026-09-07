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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';
import { PulseLogo } from '../ui/PulseLogo';

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
  onInstall: () => void;
  realtimeStatus: 'connecting' | 'live' | 'reconnecting';
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
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
  onInstall,
  realtimeStatus,
  isSidebarOpen,
  onToggleSidebar,
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
      <header className={`pulse-navbar sticky top-0 z-[1100] md:fixed md:inset-y-0 md:left-0 md:border-r md:border-b-0 bg-[#f7f7f4] border-b border-black/[0.08] ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="max-w-6xl mx-auto px-4 h-[4.25rem] md:h-full md:px-5 md:py-6 md:flex-col md:items-stretch md:justify-start flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <PulseLogo size="small" showWordmark={isSidebarOpen} />
            </button>
            <span
              className={`hidden sm:inline-flex md:absolute items-center gap-1.5 text-[10px] font-medium text-zinc-500 ${isSidebarOpen ? 'md:left-5 md:top-[5.25rem]' : 'md:left-1/2 md:-translate-x-1/2 md:top-[4.9rem]'}`}
              title={`Live updates: ${realtimeStatus}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'live' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {realtimeStatus === 'live' ? 'Live' : 'Reconnecting'}
            </span>

            <div className="relative block md:hidden" ref={circleDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCircleDropdownOpen((open) => !open)}
                className="pulse-circle-switcher flex items-center gap-1.5 max-w-[130px] sm:max-w-[180px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/80 border border-black/[0.08] shadow-sm text-xs font-semibold text-zinc-800 hover:bg-white transition-colors"
              >
                <span className="truncate">{activeCircle?.name || 'No circle'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 ${isCircleDropdownOpen ? 'rotate-180' : ''}`} />
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                        circle.id === activeCircleId
                          ? 'bg-zinc-900 text-white font-semibold'
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

          <nav className="hidden md:flex md:flex-col items-stretch gap-1.5 p-0 md:mt-20 md:mb-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-3' : 'justify-center px-2'} py-3 rounded-[13px] text-xs font-semibold transition-all ${
                    active ? 'bg-[#111318] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className={isSidebarOpen ? '' : 'sr-only'}>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 md:flex-col md:mt-auto">
            <button type="button" onClick={onToggleSidebar} className="hidden md:flex w-full items-center justify-center gap-3 rounded-[13px] px-3 py-3 text-xs font-semibold text-[#73766f] hover:bg-white" title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>{isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}{isSidebarOpen && <span>Collapse</span>}</button>
            <button type="button" onClick={onInstall} className={`hidden md:flex w-full items-center ${isSidebarOpen ? 'justify-start gap-3 px-3' : 'justify-center px-2'} rounded-[13px] py-3 text-xs font-semibold text-[#73766f] hover:bg-white`} title="Install Pulse"><Radio className="w-3.5 h-3.5" />{isSidebarOpen && <span>Install app</span>}</button>
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative w-11 h-11 md:w-full md:h-11 md:rounded-[13px] rounded-full bg-white/70 border border-black/[0.07] shadow-sm text-zinc-700 flex items-center justify-center hover:bg-white transition-colors"
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
              className="w-11 h-11 md:w-full md:h-11 md:rounded-[13px] rounded-full bg-white/70 border border-black/[0.07] shadow-sm text-zinc-700 flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className={`w-11 h-11 md:w-full md:h-11 md:rounded-[13px] rounded-full ${currentUser?.avatarColor || 'bg-zinc-800'} text-white text-[11px] font-semibold flex items-center justify-center`}
              aria-label="Account"
            >
              {getInitials(currentUser?.displayName)}
            </button>
          </div>
        </div>
      </header>

      <nav className="pulse-mobile-nav md:hidden fixed bottom-0 inset-x-0 z-[1100] bg-white/92 backdrop-blur-lg border-t border-black/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex h-[4.25rem] items-center gap-1 overflow-x-auto px-1.5 py-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 min-w-[3.75rem] flex-col items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 ${
                  active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 hover:bg-black/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 text-current" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
