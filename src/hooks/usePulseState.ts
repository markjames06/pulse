import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'live' | 'reconnecting'>('connecting');
  const notificationIdsRef = useRef(new Set<string>());

  const loadData = useCallback(async () => {
    try {
      const me = await api.getMe();
      if (!me) {
        setCurrentUser(null);
        setCircles([]);
        setShares([]);
        setPings([]);
        setMemoryPins([]);
        setNotifications([]);
        setIsRegisterRequired(true);
        return;
      }
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
      notificationIdsRef.current = new Set(fetchedNotifs.map((notification) => notification.id));
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

  useEffect(() => {
    if (isRegisterRequired || !activeCircleId) return undefined;

    const eventSource = new EventSource(`/api/events?circleId=${encodeURIComponent(activeCircleId)}`);
    setRealtimeStatus('connecting');
    eventSource.onopen = () => setRealtimeStatus('live');
    eventSource.onerror = () => setRealtimeStatus('reconnecting');
    eventSource.onmessage = (message) => {
      const event = JSON.parse(message.data) as {
        ping?: Ping;
        notification?: NotificationItem;
        share?: LocationShare;
      };
      if (event.ping) {
        setPings((current) => [event.ping!, ...current.filter((ping) => ping.id !== event.ping!.id)]);
      }
      if (event.notification) {
        const notification = event.notification;
        setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)]);
        if (!notificationIdsRef.current.has(notification.id)) {
          notificationIdsRef.current.add(notification.id);
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(notification.title, { body: notification.body, tag: notification.id });
          }
          try {
            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.frequency.value = 740;
            gain.gain.setValueAtTime(0.06, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
            oscillator.connect(gain).connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.2);
          } catch {
            // Audio can be blocked until the user interacts with the page.
          }
        }
      }
      if (event.share) {
        setShares((current) => [event.share!, ...current.filter((share) => share.id !== event.share!.id)]);
      }
    };

    return () => {
      eventSource.close();
      setRealtimeStatus('reconnecting');
    };
  }, [activeCircleId, isRegisterRequired]);

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
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          });
        });
        lat = position?.coords.latitude;
        lng = position?.coords.longitude;
      }
    }

    await api.sendPing({
      circleId: activeCircleId,
      message,
      latitude: lat,
      longitude: lng,
    });
    await loadData();
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllRead(activeCircleId);
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
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
    realtimeStatus,
    activeUserShare,
    isRegisterRequired,
    isBooting,
    handleStartShare,
    handleStopShare,
    handleSendPing,
    handleMarkAllNotificationsRead,
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
