import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationShare, MemoryPin, Ping } from '../types';
import {
  Compass,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Share2,
  Bookmark,
  Shield,
  LocateFixed,
  Navigation,
  Crosshair,
  Info,
  Flag,
  Radio,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MapViewProps {
  shares: LocationShare[];
  memoryPins: MemoryPin[];
  pings: Ping[];
  currentUserId: string;
  onOpenShareModal: () => void;
  onOpenPingModal: () => void;
  onOpenMemoryPinModal: (lat?: number, lng?: number) => void;
  onSelectMemoryPin?: (pin: MemoryPin) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  shares,
  memoryPins,
  pings,
  currentUserId,
  onOpenShareModal,
  onOpenPingModal,
  onOpenMemoryPinModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [tileMode, setTileMode] = useState<'dark' | 'street'>('dark');
  const [selectedPin, setSelectedPin] = useState<MemoryPin | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [markerVisibility, setMarkerVisibility] = useState<{
    activeShares: boolean;
    pings: boolean;
    memoryPins: boolean;
  }>({
    activeShares: true,
    pings: true,
    memoryPins: true,
  });

  const toggleMarkerVisibility = (key: keyof typeof markerVisibility) => {
    setMarkerVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Default initial center (Manila, Philippines)
  const defaultCenter: [number, number] = [14.599512, 120.984222];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const darkTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    );

    darkTiles.addTo(map);
    mapInstanceRef.current = map;

    const layerGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = layerGroup;

    // Auto-detect user's GPS device location (e.g. Philippines) on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted || !mapInstanceRef.current) return;
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          
          try {
            map.setView([userLat, userLng], 14, { animate: true });

            // Add pulsating live GPS marker
            const myLocationIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div class="relative flex items-center justify-center w-8 h-8">
                       <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                       <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-600 border-2 border-white shadow-md"></span>
                     </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            const gpsMarker = L.marker([userLat, userLng], { icon: myLocationIcon });
            gpsMarker.bindPopup('<div class="text-xs font-bold text-slate-800 p-1">Your Device GPS Location</div>');
            if (markersGroupRef.current) {
              markersGroupRef.current.addLayer(gpsMarker);
            }
          } catch (e) {
            console.log('Map GPS setView notice:', e);
          }
        },
        (err) => {
          console.log('Browser geolocation notice:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    // Click handler on map to add Memory Pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      onOpenMemoryPinModal(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.closePopup();
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Handle Tile Mode Switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const url =
      tileMode === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [tileMode]);

  // Update Markers when shares, memoryPins, or pings change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    mapInstanceRef.current.closePopup();
    const layerGroup = markersGroupRef.current;
    layerGroup.clearLayers();

    const bounds: L.LatLngBounds = L.latLngBounds([]);
    let hasCoords = false;

    // 1. Render Active Location Shares
    if (markerVisibility.activeShares) {
      shares.forEach((share) => {
        if (!share.isActive) return;

        const latLng: [number, number] = [share.latitude, share.longitude];
        bounds.extend(latLng);
        hasCoords = true;

        const isSelf = share.userId === currentUserId;
        const initials = share.userProfile?.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'U';

        const calculateTimeLeft = () => {
          const diffMs = new Date(share.expiresAt).getTime() - new Date().getTime();
          if (diffMs <= 0) return 'Expired';
          const mins = Math.floor(diffMs / 60000);
          if (mins < 60) return `${mins}m left`;
          const hrs = Math.floor(mins / 60);
          return `${hrs}h ${mins % 60}m left`;
        };

        const customIcon = L.divIcon({
          className: 'custom-pulse-marker',
          html: `
            <div class="relative flex flex-col items-center group cursor-pointer">
              <div class="relative flex items-center justify-center w-12 h-12 rounded-full ${
                share.userProfile?.avatarColor || 'bg-rose-500'
              } text-white font-bold shadow-xl border-2 border-white ring-4 ring-rose-500/20 pulse-active-avatar">
                <span>${initials}</span>
                ${
                  isSelf
                    ? '<span class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>'
                    : ''
                }
              </div>
              <div class="mt-1 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-slate-700 shadow-lg whitespace-nowrap">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>${share.userProfile?.displayName.split(' ')[0]}</span>
                <span class="text-rose-400 text-[10px] font-mono ml-0.5">• ${calculateTimeLeft()}</span>
              </div>
            </div>
          `,
          iconSize: [48, 64],
          iconAnchor: [24, 32],
        });

        const popupContent = `
          <div class="p-1 max-w-xs font-sans">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-full ${
                share.userProfile?.avatarColor || 'bg-rose-500'
              } flex items-center justify-center text-white font-bold text-xs">
                ${initials}
              </div>
              <div>
                <div class="font-bold text-sm text-slate-100">${share.userProfile?.displayName}</div>
                <div class="text-[11px] text-indigo-300 font-mono">${share.userProfile?.email || ''}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">${isSelf ? 'You (Active Sharing)' : 'Trusted Circle Member'}</div>
              </div>
            </div>
            ${
              share.label
                ? `<div class="mb-2 p-2 bg-slate-800/80 rounded-lg text-xs text-rose-200 font-medium">"${share.label}"</div>`
                : ''
            }
            <div class="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/50 p-1.5 rounded-md border border-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Time-boxed expires: <b>${calculateTimeLeft()}</b></span>
            </div>
          </div>
        `;

        const marker = L.marker(latLng, { icon: customIcon });
        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);

        // Accuracy ring
        const circle = L.circle(latLng, {
          radius: 120,
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.1,
          weight: 1,
        });
        layerGroup.addLayer(circle);
      });
    }

    // 2. Render Memory Pins
    if (markerVisibility.memoryPins) {
      memoryPins.forEach((pin) => {
        const latLng: [number, number] = [pin.latitude, pin.longitude];
        bounds.extend(latLng);
        hasCoords = true;

        const pinIcon = L.divIcon({
          className: 'custom-pulse-marker',
          html: `
            <div class="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110">
              <div class="w-10 h-10 bg-amber-500/90 text-slate-950 font-bold rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-300 shadow-amber-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </div>
              <div class="mt-0.5 px-2 py-0.5 bg-slate-900/80 text-[10px] text-amber-200 font-medium rounded-md border border-amber-500/30 whitespace-nowrap max-w-[100px] truncate">
                ${pin.caption}
              </div>
            </div>
          `,
          iconSize: [40, 50],
          iconAnchor: [20, 25],
        });

        const popupContent = `
          <div class="p-1 max-w-xs font-sans">
            <div class="flex items-center gap-2 mb-1.5">
              <div class="p-1 bg-amber-500 text-slate-950 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </div>
              <div>
                <div class="font-bold text-sm text-amber-300">Memory Pin</div>
                <div class="text-[10px] text-slate-400">Saved by ${pin.creatorProfile?.displayName || 'Circle Member'}</div>
              </div>
            </div>
            <div class="text-xs text-slate-200 mb-2 bg-slate-800/60 p-2 rounded-lg border border-slate-700">
              ${pin.caption}
            </div>
            <div class="text-[10px] text-slate-400">
              Saved on ${new Date(pin.createdAt).toLocaleDateString()}
            </div>
          </div>
        `;

        const marker = L.marker(latLng, { icon: pinIcon });
        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedPin(pin));
        layerGroup.addLayer(marker);
      });
    }

    // 3. Render Recent Pings with location
    if (markerVisibility.pings) {
      pings.forEach((ping) => {
        if (ping.latitude && ping.longitude) {
          const latLng: [number, number] = [ping.latitude, ping.longitude];

          const pingIcon = L.divIcon({
            className: 'custom-pulse-marker',
            html: `
              <div class="flex flex-col items-center group cursor-pointer">
                <div class="w-8 h-8 bg-sky-500/90 text-white rounded-full flex items-center justify-center shadow-md border-2 border-sky-300 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const popupContent = `
            <div class="p-1 font-sans">
              <div class="text-xs font-bold text-sky-400 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-sky-400"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Quick Ping</span>
              </div>
              <div class="text-xs text-slate-200 bg-slate-800/80 p-2 rounded-md border border-slate-700">
                "${ping.message}"
              </div>
              <div class="text-[10px] text-slate-400 mt-1">From ${ping.senderProfile?.displayName || 'User'}</div>
            </div>
          `;

          const marker = L.marker(latLng, { icon: pingIcon });
          marker.bindPopup(popupContent);
          layerGroup.addLayer(marker);
        }
      });
    }

    // Fit Bounds if markers exist and not manually following
    if (hasCoords && mapInstanceRef.current && !isFollowing) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    }
  }, [shares, memoryPins, pings, currentUserId, markerVisibility]);

  const performFollowCenter = () => {
    if (!mapInstanceRef.current) return;

    const activeShares = shares.filter((s) => s.isActive);
    const userShare = activeShares.find((s) => s.userId === currentUserId);

    if (userShare) {
      // Center directly on user's active location share
      mapInstanceRef.current.setView([userShare.latitude, userShare.longitude], 15, {
        animate: true,
      });
    } else if (activeShares.length > 0) {
      // Fit cluster of active circle shares
      const bounds: L.LatLngBounds = L.latLngBounds([]);
      activeShares.forEach((s) => bounds.extend([s.latitude, s.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, animate: true });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15, {
            animate: true,
          });
        },
        () => {
          mapInstanceRef.current?.setView(defaultCenter, 13, { animate: true });
        }
      );
    } else {
      mapInstanceRef.current.setView(defaultCenter, 13, { animate: true });
    }
  };

  // Keep map auto-centered when follow mode is enabled
  useEffect(() => {
    if (isFollowing) {
      performFollowCenter();
    }
  }, [isFollowing, shares]);

  const toggleFollow = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => performFollowCenter(), 50);
      }
      return next;
    });
  };

  const fitAllBounds = () => {
    if (!mapInstanceRef.current || shares.length === 0) return;
    const bounds: L.LatLngBounds = L.latLngBounds([]);
    shares.forEach((s) => bounds.extend([s.latitude, s.longitude]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
  };

  const centerOnUser = () => {
    if (!mapInstanceRef.current) return;
    const userShare = shares.find((s) => s.userId === currentUserId && s.isActive);
    if (userShare) {
      mapInstanceRef.current.setView([userShare.latitude, userShare.longitude], 15, {
        animate: true,
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15, {
            animate: true,
          });
        },
        () => {
          mapInstanceRef.current?.setView(defaultCenter, 13, { animate: true });
        }
      );
    } else {
      mapInstanceRef.current.setView(defaultCenter, 13, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem-3.5rem)] md:h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* Map Container (.leaflet-container) */}
      <div ref={mapContainerRef} className="w-full h-full z-0 relative">
        {/* Semi-transparent Map Legend Overlay inside .leaflet-container */}
        <div className="absolute top-4 left-4 z-[1000] bg-slate-900/85 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-700/60 text-xs font-medium space-y-2 text-slate-100 shadow-xl pointer-events-auto max-w-[200px] sm:max-w-[240px]">
          <div className="font-semibold text-[10px] sm:text-[11px] text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-700/50 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Map Legend</span>
            </span>
            <Info className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          {/* Active Shares (pulsing icon) */}
          <button
            type="button"
            onClick={() => toggleMarkerVisibility('activeShares')}
            className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all text-left cursor-pointer border ${
              markerVisibility.activeShares
                ? 'bg-slate-800/80 border-emerald-500/30 text-slate-100'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 hover:opacity-80'
            }`}
            title={
              markerVisibility.activeShares
                ? 'Active Shares: Real-time live GPS location. Click to hide from map.'
                : 'Active Shares: Click to show on map.'
            }
          >
            <div className="flex items-center gap-2">
              <div
                className="relative flex items-center justify-center w-5 h-5 shrink-0"
                title="Active Shares: Live GPS location"
              >
                {markerVisibility.activeShares && (
                  <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <Radio className={`relative w-4 h-4 ${markerVisibility.activeShares ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="leading-tight">
                <span className={`block font-semibold ${markerVisibility.activeShares ? 'text-slate-100' : 'text-slate-400 line-through'}`}>
                  Active Shares
                </span>
                <span className="text-[10px] text-slate-400">Live GPS location</span>
              </div>
            </div>
            {markerVisibility.activeShares ? (
              <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </button>

          {/* Pings (pin icon) */}
          <button
            type="button"
            onClick={() => toggleMarkerVisibility('pings')}
            className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all text-left cursor-pointer border ${
              markerVisibility.pings
                ? 'bg-slate-800/80 border-rose-500/30 text-slate-100'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 hover:opacity-80'
            }`}
            title={
              markerVisibility.pings
                ? 'Pings: Circle check-in request and safety alerts. Click to hide from map.'
                : 'Pings: Click to show on map.'
            }
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  markerVisibility.pings
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
                title="Pings: Circle check-in & alert pin"
              >
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className={`block font-semibold ${markerVisibility.pings ? 'text-slate-100' : 'text-slate-400 line-through'}`}>
                  Pings
                </span>
                <span className="text-[10px] text-slate-400">Circle check-ins & alerts</span>
              </div>
            </div>
            {markerVisibility.pings ? (
              <Eye className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </button>

          {/* Memory Pins (flag icon) */}
          <button
            type="button"
            onClick={() => toggleMarkerVisibility('memoryPins')}
            className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all text-left cursor-pointer border ${
              markerVisibility.memoryPins
                ? 'bg-slate-800/80 border-amber-500/30 text-slate-100'
                : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 hover:opacity-80'
            }`}
            title={
              markerVisibility.memoryPins
                ? 'Memory Pins: Bookmarked places and saved location notes. Click to hide from map.'
                : 'Memory Pins: Click to show on map.'
            }
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  markerVisibility.memoryPins
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}
                title="Memory Pins: Saved place & flag marker"
              >
                <Flag className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className={`block font-semibold ${markerVisibility.memoryPins ? 'text-slate-100' : 'text-slate-400 line-through'}`}>
                  Memory Pins
                </span>
                <span className="text-[10px] text-slate-400">Saved places & notes</span>
              </div>
            </div>
            {markerVisibility.memoryPins ? (
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Floating Action Controls Top Right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
        {/* Follow Mode Toggle Button */}
        <button
          onClick={toggleFollow}
          className={`px-3.5 py-2.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all flex items-center gap-2 font-bold text-xs ${
            isFollowing
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/30 ring-2 ring-indigo-400/50'
              : 'bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border-gray-200'
          }`}
          title={isFollowing ? 'Follow Mode Active (Click to Disable)' : 'Enable Follow Mode (Auto-center on self / cluster)'}
        >
          <Navigation className={`w-4 h-4 ${isFollowing ? 'fill-current animate-pulse' : ''}`} />
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
          {isFollowing && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
        </button>

        <button
          onClick={() => setTileMode((prev) => (prev === 'dark' ? 'street' : 'dark'))}
          className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-md transition-all"
          title="Toggle Map Style"
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={fitAllBounds}
          className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-md transition-all"
          title="Fit Circle Members"
        >
          <Compass className="w-5 h-5" />
        </button>

        <button
          onClick={centerOnUser}
          className="p-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-md transition-all"
          title="Center on Me"
        >
          <LocateFixed className="w-5 h-5 text-indigo-600" />
        </button>
      </div>

      {/* Privacy Guard Floating Pill */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-md text-xs text-slate-700 font-semibold">
        <Shield className="w-4 h-4 text-emerald-600" />
        <span>Time-boxed & Consent-First • Auto-expires</span>
      </div>

      {/* Floating Action Bar Bottom Center */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-2xl sm:rounded-3xl shadow-xl max-w-[92%] sm:max-w-md w-full px-2.5 sm:px-4">
        <button
          onClick={onOpenShareModal}
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl sm:rounded-2xl shadow-md shadow-rose-500/20 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Share Location</span>
        </button>

        <button
          onClick={onOpenPingModal}
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl sm:rounded-2xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Send Ping</span>
        </button>

        <button
          onClick={() => onOpenMemoryPinModal()}
          className="p-2 sm:p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl sm:rounded-2xl border border-amber-200/80 transition-colors shrink-0 cursor-pointer"
          title="Save Memory Pin"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
