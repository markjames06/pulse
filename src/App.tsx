import React, { useEffect, useState } from 'react';
import { Navbar, ActiveShareBanner, NotificationsDrawer, SafetyCheckInPanel } from './components/layout';
import { MapView } from './components/map';
import { CirclesManager } from './components/circles';
import { PingsList } from './components/pings';
import { MemoryPinsList } from './components/memoryPins';
import { MomentsView } from './components/moments';
import { PlansView } from './components/plans';
import {
  ShareLocationModal,
  SendPingModal,
  MemoryPinsModal,
  SettingsModal,
  RegisterAccountModal,
} from './components/modals';
import { usePulseState } from './hooks/usePulseState';
import { useModalState } from './hooks/useModalState';
import { UserProfile } from './types';
import { LandingPage } from './components/LandingPage';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { SplashScreen } from './components/SplashScreen';
import { LoadingSkeleton } from './components/LoadingSkeleton';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'circles' | 'pings' | 'memory_pins' | 'moments' | 'plans'>('map');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => localStorage.getItem('pulse:tutorial-complete') !== 'true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      window.alert('To install Pulse, open your browser menu and choose “Add to Home screen” or “Install Pulse”.');
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const finishTutorial = () => {
    localStorage.setItem('pulse:tutorial-complete', 'true');
    setShowTutorial(false);
  };

  const {
    currentUserId,
    currentUser,
    circles,
    activeCircleId,
    activeCircle,
    setActiveCircleId,
    shares,
    pings,
    memoryPins,
    notifications,
    realtimeStatus,
    activeUserShare,
    safetyCheckIns,
    activeUserCheckIn,
    moments,
    isRegisterRequired,
    isBooting,
    handleStartShare,
    handleStopShare,
    handleSendPing,
    handleMarkAllNotificationsRead,
    handleEnableDeviceAlerts,
    handleStartSafetyCheckIn,
    handleCompleteSafetyCheckIn,
    handleCreateMoment,
    handleSaveMemoryPin,
    handleDeleteMemoryPin,
    handleCreateCircle,
    handleJoinCircle,
    handleDeleteAccount,
    handleLogout,
    handleUpdateAccount,
    handleRegisterSuccess: onRegisterSuccess,
  } = usePulseState();

  const {
    isShareModalOpen,
    setIsShareModalOpen,
    isPingModalOpen,
    setIsPingModalOpen,
    isMemoryPinModalOpen,
    setIsMemoryPinModalOpen,
    memoryPinCoords,
    setMemoryPinCoords,
    openMemoryPinModal,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  } = useModalState();

  const [isLocationSelectionMode, setIsLocationSelectionMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pendingModal, setPendingModal] = useState<'share' | 'ping' | 'pin' | null>(null);

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    await onRegisterSuccess(newUser);
    setActiveTab('map');
    setIsRegisterModalOpen(false);
  };

  const handleEnterMapSelectionMode = (modalType: 'share' | 'ping' | 'pin') => {
    setPendingModal(modalType);
    setIsLocationSelectionMode(true);
    setActiveTab('map');
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setIsLocationSelectionMode(false);
    
    // Reopen the appropriate modal with the selected location
    if (pendingModal === 'share') {
      setIsShareModalOpen(true);
    } else if (pendingModal === 'ping') {
      setIsPingModalOpen(true);
    }
    
    setPendingModal(null);
  };

  const handleCancelLocationSelect = () => {
    setIsLocationSelectionMode(false);
    setSelectedLocation(null);
    setPendingModal(null);
  };

  if (isBooting) {
    return showSplash ? <SplashScreen /> : <LoadingSkeleton />;
  }

  if (!currentUser) {
    return (
      <>
        <LandingPage
          onCreateAccount={() => {
            setAuthMode('register');
            setIsAuthOpen(true);
          }}
          onSignIn={() => {
            setAuthMode('login');
            setIsAuthOpen(true);
          }}
          onInstall={() => void handleInstall()}
        />
        <RegisterAccountModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onRegisterSuccess={async (user) => {
            await onRegisterSuccess(user);
            setIsAuthOpen(false);
          }}
          initialMode={authMode}
        />
      </>
    );
  }

  return (
    <div className="app-shell min-h-dvh text-zinc-900 flex flex-col selection:bg-blue-500/20 selection:text-zinc-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        circles={circles}
        activeCircleId={activeCircleId}
        onSelectCircle={setActiveCircleId}
        currentUser={currentUser}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            void Notification.requestPermission();
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        realtimeStatus={realtimeStatus}
        onInstall={() => void handleInstall()}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />

      <div className="app-status-strip hidden sm:flex" aria-label="Current circle status">
        <span className="app-status-dot" />
        <span>{activeCircle?.name || 'Your circle'}</span>
        <span className="app-status-divider" />
        <span>{activeCircle?.members.length || 0} trusted members</span>
      </div>

      {activeUserShare && (
        <ActiveShareBanner activeShare={activeUserShare} onStopShare={handleStopShare} />
      )}

      {activeTab === 'map' && activeCircleId && (
        <SafetyCheckInPanel
          checkIns={safetyCheckIns}
          currentUserId={currentUserId}
          ownCheckIn={activeUserCheckIn}
          onStart={handleStartSafetyCheckIn}
          onComplete={handleCompleteSafetyCheckIn}
          isSidebarOpen={isSidebarOpen}
        />
      )}

      {showTutorial && <OnboardingTutorial onFinish={finishTutorial} />}

      <main
        className={`pulse-page flex-1 relative overflow-x-hidden ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${
          activeTab !== 'map' ? 'pb-24 md:pb-8' : 'pb-0'
        }`}
      >
        {activeTab === 'map' && (
          <MapView
            shares={shares}
            memoryPins={memoryPins}
            pings={pings}
            currentUserId={currentUserId}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenPingModal={() => setIsPingModalOpen(true)}
            onOpenMemoryPinModal={openMemoryPinModal}
            isLocationSelectionMode={isLocationSelectionMode}
            onLocationSelect={handleLocationSelect}
            onCancelLocationSelect={handleCancelLocationSelect}
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
            onOpenMemoryPinModal={() => openMemoryPinModal()}
            onDeleteMemoryPin={handleDeleteMemoryPin}
            onFocusPinOnMap={() => {
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'moments' && (
          <MomentsView
            moments={moments}
            circleId={activeCircleId}
            circleName={activeCircle?.name || 'Your Circle'}
            onCreateMoment={handleCreateMoment}
          />
        )}

        {activeTab === 'plans' && <PlansView circleName={activeCircle?.name || 'Your Circle'} />}
      </main>

      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedLocation(null);
        }}
        circleId={activeCircleId}
        circleName={activeCircle?.name || 'Your Circle'}
        onStartShare={async (durationMinutes, label, lat, lng) => {
          const finalLat = lat ?? selectedLocation?.lat;
          const finalLng = lng ?? selectedLocation?.lng;
          await handleStartShare(durationMinutes, label, finalLat, finalLng);
        }}
        onEnterMapSelectionMode={() => handleEnterMapSelectionMode('share')}
      />

      <SendPingModal
        isOpen={isPingModalOpen}
        onClose={() => {
          setIsPingModalOpen(false);
          setSelectedLocation(null);
        }}
        circleId={activeCircleId}
        circleName={activeCircle?.name || 'Your Circle'}
        onSendPing={async (message, attachLocation, lat, lng) => {
          const finalLat = lat ?? selectedLocation?.lat;
          const finalLng = lng ?? selectedLocation?.lng;
          await handleSendPing(message, attachLocation, finalLat, finalLng);
        }}
        onEnterMapSelectionMode={() => handleEnterMapSelectionMode('ping')}
      />

      <MemoryPinsModal
        isOpen={isMemoryPinModalOpen}
        onClose={() => {
          setIsMemoryPinModalOpen(false);
          setSelectedLocation(null);
          setMemoryPinCoords({ lat: undefined, lng: undefined });
        }}
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
        onMarkAllRead={handleMarkAllNotificationsRead}
        onEnableDeviceAlerts={handleEnableDeviceAlerts}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUserName={currentUser?.displayName || 'User'}
        currentUserEmail={currentUser?.email || ''}
        onDeleteAccount={handleDeleteAccount}
        onUpdateAccount={handleUpdateAccount}
        onLogout={handleLogout}
      />

      <RegisterAccountModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
