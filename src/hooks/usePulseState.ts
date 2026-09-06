import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { Circle, LocationShare, MemoryPin, NotificationItem, Ping, UserProfile } from '../types';
import { getRandomCoordsOffset } from '../utils/formatters';

export function usePulseState() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>('');
  const [shares, setShares] = useState<LocationShare[]>([]);
  const [pings, setPings] = useState<Ping[]>([]);
  const [memoryPins, setMemoryPins] = useState<MemoryPin[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isRegisterRequired, setIsRegisterRequired] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const me = await api.getMe();
      setCurrentUser(me);
      setIsRegisterRequired(false);

      const fetchedCircles = await api.getCircles();
      setCircles(fetchedCircles);

      const nextCircleId =
        fetchedCircles.some((circle) => circle.id === activeCircleId)
          ? activeCircleId
          : fetchedCircles[0]?.id || '';

      if (nextCircleId !== activeCircleId) {
        setActiveCircleId(nextCircleId);
      }

      if (!nextCircleId) {
        setShares([]);
        setPings([]);
        setMemoryPins([]);
        setNotifications([]);
        return;
      }

      const [fetchedShares, fetchedPings, fetchedPins, fetchedNotifs] = await Promise.all([
        api.getShares(nextCircleId),
        api.getPings(nextCircleId),
        api.getMemoryPins(nextCircleId),
        api.getNotifications(nextCircleId),
      ]);

      setShares(fetchedShares);
      setPings(fetchedPings);
      setMemoryPins(fetchedPins);
      setNotifications(fetchedNotifs);
    } catch {
      setCurrentUser(null);
      setCircles([]);
      setShares([]);
      setPings([]);
      setMemoryPins([]);
      setNotifications([]);
      setIsRegisterRequired(true);
    } finally {
      setIsBooting(false);
    }
  }, [activeCircleId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (isRegisterRequired) return undefined;

    const interval = setInterval(() => {
      void loadData();
    }, 8000);

    return () => clearInterval(interval);
  }, [loadData, isRegisterRequired]);

  const currentUserId = currentUser?.id || '';
  const activeCircle = circles.find((circle) => circle.id === activeCircleId) || circles[0];
  const activeUserShare = shares.find(
    (share) => share.userId === currentUserId && share.circleId === activeCircleId && share.isActive
  );

  const handleStartShare = async (
    durationMinutes: number,
    label?: string,
    lat?: number,
    lng?: number
  ) => {
    const coords = getRandomCoordsOffset(lat, lng);
    await api.startShare({
      circleId: activeCircleId,
      durationMinutes,
      label,
      latitude: coords.lat,
      longitude: coords.lng,
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
      const coords = getRandomCoordsOffset();
      lat = coords.lat;
      lng = coords.lng;
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
    setCurrentUser(null);
    setIsRegisterRequired(true);
    await loadData();
  };

  const handleLogout = async () => {
    await api.logoutUser();
    setCurrentUser(null);
    setIsRegisterRequired(true);
    await loadData();
  };

  const handleUpdateAccount = async (displayName: string, email: string) => {
    await api.updateMe({ displayName, email });
    await loadData();
  };

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    setCurrentUser(newUser);
    setIsRegisterRequired(false);
    await loadData();
  };

  return {
    users: currentUser ? [currentUser] : [],
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
    activeUserShare,
    isRegisterRequired,
    isBooting,
    handleStartShare,
    handleStopShare,
    handleSendPing,
    handleSaveMemoryPin,
    handleDeleteMemoryPin,
    handleCreateCircle,
    handleJoinCircle,
    handleDeleteAccount,
    handleLogout,
    handleUpdateAccount,
    handleRegisterSuccess,
    loadData,
  };
}
