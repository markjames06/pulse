import { useState, useEffect, useCallback } from 'react';
import { api, setApiActiveUserId } from '../api';
import { Circle, LocationShare, MemoryPin, NotificationItem, Ping, UserProfile } from '../types';
import { getRandomCoordsOffset } from '../utils/formatters';

export function usePulseState() {
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
  const [isRegisterRequired, setIsRegisterRequired] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);

      if (fetchedUsers.length === 0) {
        setIsRegisterRequired(true);
      } else if (!currentUserId || !fetchedUsers.some((u: UserProfile) => u.id === currentUserId)) {
        const defaultUser = fetchedUsers[0];
        setCurrentUserId(defaultUser.id);
        setApiActiveUserId(defaultUser.id);
        localStorage.setItem('pulse_user_id', defaultUser.id);
      }

      const fetchedCircles = await api.getCircles();
      setCircles(fetchedCircles);

      if (fetchedCircles.length > 0 && !fetchedCircles.some((c: Circle) => c.id === activeCircleId)) {
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
  }, [currentUserId, activeCircleId]);

  useEffect(() => {
    setApiActiveUserId(currentUserId);
    loadData();
  }, [currentUserId, activeCircleId, loadData]);

  // Polling every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 4000);

    return () => clearInterval(interval);
  }, [loadData]);

  const activeUserShare = shares.find(
    (s: LocationShare) => s.userId === currentUserId && s.circleId === activeCircleId && s.isActive
  );

  const activeCircle = circles.find((c: Circle) => c.id === activeCircleId) || circles[0];
  const currentUser = users.find((u: UserProfile) => u.id === currentUserId) || users[0];

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    setApiActiveUserId(userId);
    localStorage.setItem('pulse_user_id', userId);
  };

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
    localStorage.removeItem('pulse_user_id');
    setCurrentUserId('');
    setApiActiveUserId('');
    await loadData();
    setIsRegisterRequired(true);
  };

  const handleUpdateAccount = async (displayName: string, email: string) => {
    await api.updateMe({ displayName, email });
    await loadData();
  };

  const handleRegisterSuccess = async (newUser: UserProfile) => {
    setCurrentUserId(newUser.id);
    setApiActiveUserId(newUser.id);
    localStorage.setItem('pulse_user_id', newUser.id);
    setIsRegisterRequired(false);
    await loadData();
  };

  return {
    users,
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
    handleSwitchUser,
    handleStartShare,
    handleStopShare,
    handleSendPing,
    handleSaveMemoryPin,
    handleDeleteMemoryPin,
    handleCreateCircle,
    handleJoinCircle,
    handleDeleteAccount,
    handleUpdateAccount,
    handleRegisterSuccess,
    loadData,
  };
}
