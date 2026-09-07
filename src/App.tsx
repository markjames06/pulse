import React, { useState } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'circles' | 'pings' | 'memory_pins' | 'moments' | 'plans'>('map');

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
    openMemoryPinModal,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  } = useModalState();

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    await onRegisterSuccess(newUser);
    setActiveTab('map');
    setIsRegisterModalOpen(false);
  };

  if (isBooting) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 text-zinc-500 text-sm">
        <span className="w-10 h-10 rounded-[14px] bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-900/15">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        </span>
        <span className="font-medium tracking-tight">Loading Pulse</span>
      </div>
    );
  }

  return (
    <div className="min-h-dvh text-zinc-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-zinc-950">
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
      />

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
        />
      )}

      <main
        className={`pulse-page flex-1 relative overflow-x-hidden ${
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
        isOpen={isRegisterModalOpen || isRegisterRequired}
        required={isRegisterRequired}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
