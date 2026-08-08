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
  UserPlus,
  Check,
  User,
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';

interface NavbarProps {
  activeTab: 'map' | 'circles' | 'pings' | 'memory_pins';
  setActiveTab: (tab: 'map' | 'circles' | 'pings' | 'memory_pins') => void;
  circles: Circle[];
  activeCircleId: string;
  onSelectCircle: (id: string) => void;
  users: UserProfile[];
  currentUserId: string;
  onSwitchUser: (userId: string) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenRegisterModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  circles,
  activeCircleId,
  onSelectCircle,
  users,
  currentUserId,
  onSwitchUser,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSettings,
  onOpenRegisterModal,
}) => {
  const [isCircleDropdownOpen, setIsCircleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const circleDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const activeCircle = circles.find((c) => c.id === activeCircleId) || circles[0];
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        circleDropdownRef.current &&
        !circleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCircleDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[1100] bg-slate-900/90 backdrop-blur-xl border-b border-white/10 text-white transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Circle Dropdown */}
        <div className="flex items-center gap-3 md:gap-6">
          <div
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PULSE
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
          </div>

          {/* Active Circle Selector */}
          <div className="relative" ref={circleDropdownRef}>
            <button
              onClick={() => setIsCircleDropdownOpen(!isCircleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[100px] sm:max-w-[140px] truncate">
                {activeCircle?.name || 'Select Circle'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isCircleDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCircleDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Your Circles ({circles.length})
                </div>
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {circles.map((circle) => (
                    <button
                      key={circle.id}
                      onClick={() => {
                        onSelectCircle(circle.id);
                        setIsCircleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        circle.id === activeCircleId
                          ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate">{circle.name}</span>
                      {circle.id === activeCircleId && (
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 mt-1.5 pt-1.5">
                  <button
                    onClick={() => {
                      setIsCircleDropdownOpen(false);
                      setActiveTab('circles');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-400 hover:bg-indigo-950/40 transition-colors flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage Circles</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Live Map</span>
          </button>

          <button
            onClick={() => setActiveTab('circles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'circles'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Circles</span>
          </button>

          <button
            onClick={() => setActiveTab('pings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pings'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Pings</span>
          </button>

          <button
            onClick={() => setActiveTab('memory_pins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'memory_pins'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Memory Pins</span>
          </button>
        </nav>

        {/* Right: Actions, Notifications & Account Profile Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-lg shadow-rose-500/50 animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Active Logged-in User Switcher Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div
                className={`w-7 h-7 rounded-xl ${
                  currentUser?.avatarColor || 'bg-indigo-600'
                } text-white font-bold text-xs flex items-center justify-center shadow-md`}
              >
                {getInitials(currentUser?.displayName)}
              </div>
              <span className="hidden lg:inline-block text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                {currentUser?.displayName || 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Active Demo Account
                </div>

                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user.id);
                        setIsUserDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        user.id === currentUserId
                          ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg ${user.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                        >
                          {getInitials(user.displayName)}
                        </div>
                        <div className="text-left truncate">
                          <div className="truncate">{user.displayName}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                        </div>
                      </div>
                      {user.id === currentUserId && (
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {onOpenRegisterModal && (
                  <div className="border-t border-white/10 mt-1.5 pt-1.5">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onOpenRegisterModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-emerald-400 hover:bg-emerald-950/30 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register / Add Member</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1100] bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'map' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('circles')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'circles' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Circles</span>
        </button>

        <button
          onClick={() => setActiveTab('pings')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'pings' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span>Pings</span>
        </button>

        <button
          onClick={() => setActiveTab('memory_pins')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'memory_pins' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Pins</span>
        </button>
      </nav>
    </header>
  );
};
