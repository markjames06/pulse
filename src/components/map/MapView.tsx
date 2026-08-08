import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationShare, MemoryPin, Ping } from '../../types';
import {
  createDeviceGpsIcon,
  createLocationShareIcon,
  createMemoryPinIcon,
  createPingIcon,
} from './mapUtils';
import { MapControls } from './MapControls';
import { MapOverlayActions } from './MapOverlayActions';
import { formatTimeAgo } from '../../utils/formatters';

export interface MapViewProps {
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
  const userGpsMarkerRef = useRef<L.Marker | null>(null);

  const [tileMode, setTileMode] = useState<'dark' | 'street'>('dark');
  const [markerVisibility, setMarkerVisibility] = useState({
    activeShares: true,
    pings: true,
    memoryPins: true,
  });

  const defaultCenter: [number, number] = [14.599512, 120.984222];

  const handleToggleVisibility = (key: keyof typeof markerVisibility) => {
    setMarkerVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mapInstanceRef.current) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        mapInstanceRef.current.setView([lat, lng], 15, { animate: true });

        if (userGpsMarkerRef.current) {
          userGpsMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const gpsMarker = L.marker([lat, lng], { icon: createDeviceGpsIcon() });
          gpsMarker.bindPopup(
            '<div class="text-xs font-bold text-slate-800 p-1">Your Device GPS Location</div>'
          );
          if (markersGroupRef.current) {
            markersGroupRef.current.addLayer(gpsMarker);
            userGpsMarkerRef.current = gpsMarker;
          }
        }
      },
      (err) => console.log('Geolocation notice:', err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const darkTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    );

    darkTiles.addTo(map);
    mapInstanceRef.current = map;

    const layerGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = layerGroup;

    // Detect user position once on mount
    handleLocateUser();

    // Map click -> add pin modal
    map.on('click', (e: L.LeafletMouseEvent) => {
      onOpenMemoryPinModal(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.closePopup();
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
        userGpsMarkerRef.current = null;
      }
    };
  }, []);

  // 2. Handle Tile Layer Switch
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

  // 3. Render Markers when data or visibility changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const layerGroup = markersGroupRef.current;
    layerGroup.clearLayers();
    userGpsMarkerRef.current = null;

    const bounds: L.LatLngBounds = L.latLngBounds([]);
    let hasCoords = false;

    // A. Location Shares
    if (markerVisibility.activeShares) {
      shares.forEach((share) => {
        if (!share.isActive) return;

        const latLng: [number, number] = [share.latitude, share.longitude];
        bounds.extend(latLng);
        hasCoords = true;

        const isSelf = share.userId === currentUserId;
        const marker = L.marker(latLng, {
          icon: createLocationShareIcon(share, isSelf),
        });

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-full ${share.userProfile?.avatarColor || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center">
                ${share.userProfile?.displayName ? share.userProfile.displayName[0] : 'U'}
              </div>
              <div>
                <h4 class="font-bold text-sm text-slate-100">${share.userProfile?.displayName || 'User'}</h4>
                <p class="text-[10px] text-slate-400">Sharing Live Location</p>
              </div>
            </div>
            ${share.label ? `<p class="text-xs text-indigo-300 font-medium mb-1">🏷️ ${share.label}</p>` : ''}
            <div class="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/50 pt-2 mt-2">
              <span>Expires ${formatTimeAgo(share.expiresAt)}</span>
              ${isSelf ? '<span class="text-emerald-400 font-bold">(You)</span>' : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    // B. Pings
    if (markerVisibility.pings) {
      pings.forEach((ping) => {
        if (ping.latitude === undefined || ping.longitude === undefined) return;

        const latLng: [number, number] = [ping.latitude, ping.longitude];
        bounds.extend(latLng);
        hasCoords = true;

        const marker = L.marker(latLng, { icon: createPingIcon(ping) });

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-rose-400 text-base">⚡</span>
              <h4 class="font-bold text-xs text-rose-300">Ping from ${ping.senderProfile?.displayName || 'Circle Member'}</h4>
            </div>
            <p class="text-xs text-slate-200 bg-slate-800/80 p-2 rounded-lg border border-white/5 mb-2">"${ping.message}"</p>
            <span class="text-[10px] text-slate-400">${formatTimeAgo(ping.createdAt)}</span>
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    // C. Memory Pins
    if (markerVisibility.memoryPins) {
      memoryPins.forEach((pin) => {
        const latLng: [number, number] = [pin.latitude, pin.longitude];
        bounds.extend(latLng);
        hasCoords = true;

        const marker = L.marker(latLng, { icon: createMemoryPinIcon(pin) });

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl">${pin.emoji || '📍'}</span>
              <h4 class="font-bold text-sm text-slate-100">${pin.caption}</h4>
            </div>
            <p class="text-[11px] text-slate-400 mb-2">Saved by ${pin.creatorProfile?.displayName || 'Member'}</p>
            <span class="text-[10px] text-amber-400/80">${formatTimeAgo(pin.createdAt)}</span>
          </div>
        `;

        marker.bindPopup(popupContent);
        layerGroup.addLayer(marker);
      });
    }

    // Auto-fit map bounds if markers present
    if (hasCoords && shares.length > 0) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (e) {
        console.log('Bounds fit notice:', e);
      }
    }
  }, [shares, memoryPins, pings, currentUserId, markerVisibility]);

  const counts = {
    shares: shares.filter((s) => s.isActive).length,
    pings: pings.filter((p) => p.latitude !== undefined).length,
    memoryPins: memoryPins.length,
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative overflow-hidden bg-slate-950">
      {/* Map Element Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Controls */}
      <MapControls
        tileMode={tileMode}
        onToggleTileMode={() => setTileMode((prev) => (prev === 'dark' ? 'street' : 'dark'))}
        onLocateUser={handleLocateUser}
        markerVisibility={markerVisibility}
        onToggleVisibility={handleToggleVisibility}
        counts={counts}
      />

      {/* Quick Action Overlay */}
      <MapOverlayActions
        onOpenShareModal={onOpenShareModal}
        onOpenPingModal={onOpenPingModal}
        onOpenMemoryPinModal={() => onOpenMemoryPinModal()}
      />
    </div>
  );
};
