import L from 'leaflet';
import { LocationShare, MemoryPin, Ping } from '../../types';
import { getInitials } from '../../utils/formatters';

export function createDeviceGpsIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-600 border-2 border-white shadow-md"></span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function createLocationShareIcon(share: LocationShare, isSelf: boolean): L.DivIcon {
  const initials = getInitials(share.userProfile?.displayName);
  const color = share.userProfile?.avatarColor || 'bg-indigo-600';
  const label = share.label ? `<span class="truncate max-w-[80px]">${share.label}</span>` : '';

  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer">
        <div class="relative">
          <span class="animate-ping absolute -inset-1 rounded-full ${isSelf ? 'bg-emerald-400' : 'bg-indigo-400'} opacity-75"></span>
          <div class="relative w-10 h-10 rounded-full ${color} text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xl">
            ${initials}
          </div>
        </div>
        <div class="mt-1 px-2 py-0.5 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold text-white shadow-lg flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full ${isSelf ? 'bg-emerald-400' : 'bg-indigo-400'} animate-pulse"></span>
          ${isSelf ? 'You' : share.userProfile?.displayName?.split(' ')[0] || 'User'}
          ${label ? ` • ${label}` : ''}
        </div>
      </div>
    `,
    iconSize: [44, 56],
    iconAnchor: [22, 28],
    popupAnchor: [0, -28],
  });
}

export function createMemoryPinIcon(pin: MemoryPin): L.DivIcon {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer">
        <div class="w-9 h-9 rounded-2xl bg-amber-500/90 backdrop-blur-md border-2 border-white text-white font-bold text-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          ${pin.emoji || '📍'}
        </div>
        <div class="mt-1 px-2 py-0.5 bg-amber-950/90 backdrop-blur-md border border-amber-500/30 rounded-full text-[10px] font-semibold text-amber-200 shadow-lg truncate max-w-[100px]">
          ${pin.caption}
        </div>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 26],
    popupAnchor: [0, -26],
  });
}

export function createPingIcon(ping: Ping): L.DivIcon {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer">
        <div class="relative">
          <span class="animate-ping absolute -inset-1 rounded-full bg-rose-500 opacity-75"></span>
          <div class="relative w-9 h-9 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xl">
            ⚡
          </div>
        </div>
        <div class="mt-1 px-2 py-0.5 bg-rose-950/90 backdrop-blur-md border border-rose-500/30 rounded-full text-[10px] font-semibold text-rose-200 shadow-lg truncate max-w-[110px]">
          ${ping.senderProfile?.displayName?.split(' ')[0] || 'Ping'}: ${ping.message}
        </div>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 26],
    popupAnchor: [0, -26],
  });
}
