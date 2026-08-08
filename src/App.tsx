import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { ShareLocationModal } from './components/ShareLocationModal';
import { ActiveShareBanner } from './components/ActiveShareBanner';
import { SendPingModal } from './components/SendPingModal';
import { MemoryPinsModal } from './components/MemoryPinsModal';
import { CirclesManager } from './components/CirclesManager';
import { PingsList } from './components/PingsList';
import { MemoryPinsList } from './components/MemoryPinsList';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { RegisterAccountModal } from './components/RegisterAccountModal';
import { api, setApiActiveUserId, getApiActiveUserId } from './lib/api';
import { Circle, LocationShare, MemoryPin, NotificationItem, Ping, UserProfile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'circles' | 'pings' | 'memory_pins'>('map');

  // Core Data State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('pulse_user_id') || '';
  });
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>('circ_family');

  const [shares, setShares] = useState<LocationShare[]>([]);
  const [pings, setPings] = useState<Ping[]>([]);
  const [memoryPins, setMemoryPins] = useState<MemoryPin[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [isMemoryPinModalOpen, setIsMemoryPinModalOpen] = useState(false);
  const [memoryPinCoords, setMemoryPinCoords] = useState<{ lat?: number; lng?: number }>({});
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Fetch all initial data & setup polling
  const loadData = async () => {
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);

      if (fetchedUsers.length === 0) {
        setIsRegisterModalOpen(true);
      } else if (!currentUserId || !fetchedUsers.some((u) => u.id === currentUserId)) {
        const defaultUser = fetchedUsers[0];
        setCurrentUserId(defaultUser.id);
        setApiActiveUserId(defaultUser.id);
        localStorage.setItem('pulse_user_id', defaultUser.id);
      }

      const fetchedCircles = await api.getCircles();
      setCircles(fetchedCircles);

      if (fetchedCircles.length > 0 && !fetchedCircles.some((c) => c.id === activeCircleId)) {
        setActiveCircleId(fetchedCircles[0].id);
      }

      const fetchedShares = await api.getShares(activeCircleId);
      setShares(fetchedShares);

      const fetchedPings = await api.getPings(activeCircleId);
      setPings(fetchedPings);

      const fetchedPins = await api.getMemoryPins(activeCircleId);
      setMemoryPins(fetchedPins);

      const fetchedNotifs = await api.getNotifications(activeCircleId);
      setNotifications(fetchedNotifs);
    } catch (err) {
      console.error('Error loading Pulse data:', err);
    }
  };

  useEffect(() => {
    setApiActiveUserId(currentUserId);
    loadData();
  }, [currentUserId, activeCircleId]);

  // Polling for live location updates & real-time shares
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 4000); // Poll every 4s for live feel

    return () => clearInterval(interval);
  }, [currentUserId, activeCircleId]);

  // Active Share by current logged-in user in active circle
  const activeUserShare = shares.find(
    (s) => s.userId === currentUserId && s.circleId === activeCircleId && s.isActive
  );

  const activeCircle = circles.find((c) => c.id === activeCircleId) || circles[0];
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Actions
  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    setApiActiveUserId(userId);
    localStorage.setItem('pulse_user_id', userId);
    setActiveTab('map');
  };

  const handleStartShare = async (
    durationMinutes: number,
    label?: string,
    lat?: number,
    lng?: number
  ) => {
    const defaultLat = lat ?? (14.599512 + (Math.random() - 0.5) * 0.01);
    const defaultLng = lng ?? (120.984222 + (Math.random() - 0.5) * 0.01);

    await api.startShare({
      circleId: activeCircleId,
      durationMinutes,
      label,
      latitude: defaultLat,
      longitude: defaultLng,
    });

    await loadData();
  };

  const handleStopShare = async (shareId: string) => {
    await api.stopShare(shareId);
    await loadData();
  };

  const handleSendPing = async (message: string, attachLocation: boolean) => {
    let lat: number | undefined;
    let lng: number | undefined;

    if (attachLocation) {
      lat = 14.599512 + (Math.random() - 0.5) * 0.01;
      lng = 120.984222 + (Math.random() - 0.5) * 0.01;
    }

    await api.sendPing({
      circleId: activeCircleId,
      message,
      latitude: lat,
      longitude: lng,
    });

    await loadData();
  };

  const handleSaveMemoryPin = async (
    caption: string,
    emoji: string,
    lat: number,
    lng: number
  ) => {
    await api.createMemoryPin({
      circleId: activeCircleId,
      caption,
      emoji,
      latitude: lat,
      longitude: lng,
    });

    await loadData();
  };

  const handleDeleteMemoryPin = async (pinId: string) => {
    await api.deleteMemoryPin(pinId);
    await loadData();
  };

  const handleCreateCircle = async (name: string) => {
    const newCircle = await api.createCircle({ name });
    setActiveCircleId(newCircle.id);
    await loadData();
  };

  const handleJoinCircle = async (inviteCode: string) => {
    const joinedCircle = await api.joinCircle({ inviteCode });
    setActiveCircleId(joinedCircle.id);
    await loadData();
  };

  const handleDeleteAccount = async () => {
    await api.deleteAccount();
    localStorage.removeItem('pulse_user_id');
    setCurrentUserId('');
    setApiActiveUserId('');
    await loadData();
    setIsRegisterModalOpen(true);
  };

  const handleUpdateAccount = async (displayName: string, email: string) => {
    await api.updateMe({ displayName, email });
    await loadData();
  };

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    setCurrentUserId(newUser.id);
    setApiActiveUserId(newUser.id);
    localStorage.setItem('pulse_user_id', newUser.id);
    setActiveTab('map');
    await loadData();
    // Auto prompt share location modal for instant live map participation
    setIsShareModalOpen(true);
  };

  const handleOpenMemoryPinModalWithCoords = (lat?: number, lng?: number) => {
    setMemoryPinCoords({ lat, lng });
    setIsMemoryPinModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfc] text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        circles={circles}
        activeCircleId={activeCircleId}
        onSelectCircle={setActiveCircleId}
        users={users}
        currentUserId={currentUserId}
        onSwitchUser={handleSwitchUser}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      />

      {/* Active Location Share Floating Banner */}
      {activeUserShare && (
        <ActiveShareBanner
          activeShare={activeUserShare}
          onStopShare={handleStopShare}
        />
      )}

      {/* Main View Area */}
      <main className={`flex-1 relative overflow-x-hidden ${activeTab !== 'map' ? 'pb-20 md:pb-6' : ''}`}>
        {activeTab === 'map' && (
          <MapView
            shares={shares}
            memoryPins={memoryPins}
            pings={pings}
            currentUserId={currentUserId}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenPingModal={() => setIsPingModalOpen(true)}
            onOpenMemoryPinModal={handleOpenMemoryPinModalWithCoords}
          />
        )}

        {activeTab === 'circles' && (
          <CirclesManager
            circles={circles}
            activeCircleId={activeCircleId}
            onSelectCircle={setActiveCircleId}
            onCreateCircle={handleCreateCircle}
            onJoinCircle={handleJoinCircle}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === 'pings' && (
          <PingsList
            pings={pings}
            onOpenPingModal={() => setIsPingModalOpen(true)}
            circleName={activeCircle?.name || 'Your Circle'}
          />
        )}

        {activeTab === 'memory_pins' && (
          <MemoryPinsList
            memoryPins={memoryPins}
            currentUserId={currentUserId}
            circleName={activeCircle?.name || 'Your Circle'}
            onOpenMemoryPinModal={() => handleOpenMemoryPinModalWithCoords()}
            onDeleteMemoryPin={handleDeleteMemoryPin}
            onFocusPinOnMap={(pin) => {
              setActiveTab('map');
            }}
          />
        )}
      </main>

      {/* Modals */}
      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        circleId={activeCircleId}
        circleName={activeCircle?.name || 'Your Circle'}
        onStartShare={handleStartShare}
      />

      <SendPingModal
        isOpen={isPingModalOpen}
        onClose={() => setIsPingModalOpen(false)}
        circleId={activeCircleId}
        circleName={activeCircle?.name || 'Your Circle'}
        onSendPing={handleSendPing}
      />

      <MemoryPinsModal
        isOpen={isMemoryPinModalOpen}
        onClose={() => setIsMemoryPinModalOpen(false)}
        circleId={activeCircleId}
        circleName={activeCircle?.name || 'Your Circle'}
        initialLat={memoryPinCoords.lat}
        initialLng={memoryPinCoords.lng}
        onSaveMemoryPin={handleSaveMemoryPin}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUserName={currentUser?.displayName || 'User'}
        currentUserEmail={currentUser?.email || 'user@example.com'}
        onDeleteAccount={handleDeleteAccount}
        onUpdateAccount={handleUpdateAccount}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      />

      <RegisterAccountModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        existingUsers={users}
        onSelectExistingUser={handleSwitchUser}
      />
    </div>
  );
}
