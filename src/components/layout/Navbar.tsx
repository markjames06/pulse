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
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';

interface NavbarProps {
  activeTab: 'map' | 'circles' | 'pings' | 'memory_pins';
  setActiveTab: (tab: 'map' | 'circles' | 'pings' | 'memory_pins') => void;
  circles: Circle[];
  activeCircleId: string;
  onSelectCircle: (id: string) => void;
  currentUser?: UserProfile | null;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
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
  ];

  return (
    <>
      <header className="sticky top-0 z-[1100] bg-[#f7f6f3]/85 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2.5 shrink-0"
            >
              <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                <Radio className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold tracking-tight text-zinc-900">Pulse</span>
            </button>

            <div className="relative hidden sm:block" ref={circleDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCircleDropdownOpen((open) => !open)}
                className="flex items-center gap-2 max-w-[180px] px-3 py-1.5 rounded-full bg-white border border-black/8 text-xs font-medium text-zinc-700"
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

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white border border-black/8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative w-9 h-9 rounded-full bg-white border border-black/8 text-zinc-700 flex items-center justify-center"
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
              className="w-9 h-9 rounded-full bg-white border border-black/8 text-zinc-700 flex items-center justify-center"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className={`w-9 h-9 rounded-full ${currentUser?.avatarColor || 'bg-zinc-800'} text-white text-[11px] font-semibold flex items-center justify-center`}
              aria-label="Account"
            >
              {getInitials(currentUser?.displayName)}
            </button>
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[1100] bg-[#f7f6f3]/95 backdrop-blur-xl border-t border-black/5 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                  active ? 'text-zinc-900' : 'text-zinc-400'
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
