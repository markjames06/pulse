import L from 'leaflet';
import { LocationShare, MemoryPin, Ping } from '../../types';
import { getInitials, escapeHtml } from '../../utils/formatters';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const OSM_TILE_OPTIONS: L.TileLayerOptions = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abc',
  maxZoom: 19,
};

const SATELLITE_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_TILE_OPTIONS: L.TileLayerOptions = {
  attribution: 'Tiles &copy; Esri',
  maxZoom: 19,
};

export function applyMapTiles(map: L.Map, tileMode: 'auto' | 'street' | 'satellite') {
  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer);
    }
  });

  if (tileMode === 'satellite') {
    L.tileLayer(SATELLITE_TILE_URL, SATELLITE_TILE_OPTIONS).addTo(map);
  } else {
    L.tileLayer(OSM_TILE_URL, OSM_TILE_OPTIONS).addTo(map);
  }
  map.getContainer().classList.toggle('pulse-dark-tiles', false);
}

export function getMemoryPinIconSvg(value?: string): string {
  const icon = value || 'pin';
  const paths: Record<string, string> = {
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    coffee: '<path d="M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2M8 4c0 1 1 1 1 2M12 4c0 1 1 1 1 2"/>',
    heart: '<path d="M20.8 8.8c0 5.2-8.8 10.4-8.8 10.4S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"/>',
    beach: '<path d="M3 19c4-3 6-3 9 0s5 3 9 0"/><path d="M12 18V5M8 9c2-2 6-2 8 0M6 5c2-2 4-2 6 0 2-2 4-2 6 0"/>',
    food: '<path d="M6 3v8M3 3v5a3 3 0 0 0 6 0V3M6 11v10M16 3v18M16 3c3 2 3 6 0 8"/>',
    celebration: '<path d="m4 20 8-8M9 21l3-9 4 5 5-3-3 5 4 1-9 1Z"/><path d="M5 4v3M3.5 5.5h3M18 3v3M16.5 4.5h3"/>',
    car: '<path d="m5 16 1.5-6h11L19 16M4 16h16v4H4zM7 20v2M17 20v2M7 14h.01M17 14h.01"/>',
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[icon] || paths.pin}</svg>`;
}

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
  const initials = escapeHtml(getInitials(share.userProfile?.displayName));
  const color = escapeHtml(share.userProfile?.avatarColor || 'bg-zinc-800');
  const firstName = escapeHtml(share.userProfile?.displayName?.split(' ')[0] || 'User');
  const label = share.label
    ? `<span class="truncate max-w-[80px]">${escapeHtml(share.label)}</span>`
    : '';

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
        <div class="mt-1 px-2 py-0.5 bg-white border border-black/10 rounded-full text-[10px] font-semibold text-zinc-800 shadow-lg flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full ${isSelf ? 'bg-emerald-400' : 'bg-indigo-400'} animate-pulse"></span>
          ${isSelf ? 'You' : firstName}
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
        <div class="w-9 h-9 rounded-xl bg-white border border-black/15 text-zinc-800 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          ${getMemoryPinIconSvg(pin.emoji)}
        </div>
        <div class="mt-1 px-2 py-0.5 bg-white border border-black/10 rounded-full text-[10px] font-semibold text-zinc-800 shadow-lg truncate max-w-[100px]">
          ${escapeHtml(pin.caption)}
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/></svg>
          </div>
        </div>
        <div class="mt-1 px-2 py-0.5 bg-white border border-black/10 rounded-full text-[10px] font-semibold text-zinc-800 shadow-lg truncate max-w-[110px]">
          ${escapeHtml(ping.senderProfile?.displayName?.split(' ')[0] || 'Ping')}: ${escapeHtml(ping.message)}
        </div>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 26],
    popupAnchor: [0, -26],
  });
}
