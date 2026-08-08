import React, { useState, useRef, useEffect } from 'react';
import { Circle, UserProfile } from '../types';
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
  LogOut,
} from 'lucide-react';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeCircle = circles.find((c) => c.id === activeCircleId) || circles[0];
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand & Circle Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Logo */}
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 cursor-pointer group focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 p-0.5 shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-all">
                <div className="w-full h-full bg-indigo-600 rounded-[10px] flex items-center justify-center">
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
                </div>
              </div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Pulse
              </span>
            </button>

            {/* Circle Selector Pill */}
            {circles.length > 0 && (
              <div className="relative flex items-center">
                <select
                  value={activeCircleId}
                  onChange={(e) => onSelectCircle(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-full text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors max-w-[130px] sm:max-w-[180px] truncate"
                >
                  {circles.map((circle) => (
                    <option key={circle.id} value={circle.id} className="bg-white text-slate-800">
                      {circle.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Desktop Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200/80 rounded-full">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Live Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('circles')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'circles'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Circles ({activeCircle?.members.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pings')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pings'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Pings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('memory_pins')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'memory_pins'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Memories</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications Toggle */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative w-9 h-9 sm:w-10 sm:h-10 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Settings Toggle */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-9 h-9 sm:w-10 sm:h-10 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-full flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Account Profile / Switcher Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-full transition-all cursor-pointer active:scale-95 min-h-[36px]"
              >
                <div
                  className={`w-7 h-7 rounded-full ${
                    currentUser?.avatarColor || 'bg-indigo-600'
                  } text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0`}
                >
                  {getInitials(currentUser?.displayName)}
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                  {currentUser?.displayName?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {/* Profile Popover Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Current Active Account Header */}
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Current Account
                    </span>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full ${
                          currentUser?.avatarColor || 'bg-indigo-600'
                        } text-white font-bold text-xs flex items-center justify-center shrink-0`}
                      >
                        {getInitials(currentUser?.displayName)}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">
                          {currentUser?.displayName || 'User'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {currentUser?.email || ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Switch Profile Section */}
                  {users.length > 1 && (
                    <div className="py-1 border-b border-slate-100">
                      <span className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Switch Active Profile
                      </span>
                      <div className="max-h-36 overflow-y-auto space-y-0.5 px-1">
                        {users.map((u) => {
                          const isSelected = u.id === currentUserId;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                onSwitchUser(u.id);
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 text-indigo-900 font-bold'
                                  : 'hover:bg-slate-50 text-slate-700 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div
                                  className={`w-5 h-5 rounded-full ${u.avatarColor} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                                >
                                  {getInitials(u.displayName)}
                                </div>
                                <span className="truncate">{u.displayName}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1 px-1">
                    {onOpenRegisterModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRegisterModal();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Sign In / Register New Account</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Settings & Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-lg px-2 py-1.5 pb-safe flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
            activeTab === 'map'
              ? 'bg-indigo-50 text-indigo-600 font-extrabold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="text-[10px] leading-none">Map</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('circles')}
          className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
            activeTab === 'circles'
              ? 'bg-indigo-50 text-indigo-600 font-extrabold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] leading-none">Circles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pings')}
          className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
            activeTab === 'pings'
              ? 'bg-indigo-50 text-indigo-600 font-extrabold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-[10px] leading-none">Pings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('memory_pins')}
          className={`flex-1 py-1.5 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
            activeTab === 'memory_pins'
              ? 'bg-indigo-50 text-indigo-600 font-extrabold'
              : 'text-slate-500 font-medium hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[10px] leading-none">Memories</span>
        </button>
      </nav>
    </>
  );
};
