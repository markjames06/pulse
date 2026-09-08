import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';
import { Circle, LocationShare, MemoryPin, NotificationItem, Ping, PulseMoment, SafetyCheckIn, UserProfile } from '../types';
import { getFriendlyPlaceName } from '../utils/formatters';

function decodeVapidKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function usePulseState() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>('');
  const [shares, setShares] = useState<LocationShare[]>([]);
  const [pings, setPings] = useState<Ping[]>([]);
  const [memoryPins, setMemoryPins] = useState<MemoryPin[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [safetyCheckIns, setSafetyCheckIns] = useState<SafetyCheckIn[]>([]);
  const [moments, setMoments] = useState<PulseMoment[]>([]);
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
        setSafetyCheckIns([]);
        setMoments([]);
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
        setSafetyCheckIns([]);
        setMoments([]);
        return;
      }

      let fetchedShares: LocationShare[] = [];
      let fetchedPings: Ping[] = [];
      let fetchedPins: MemoryPin[] = [];
      let fetchedNotifs: NotificationItem[] = [];
      let fetchedCheckIns: SafetyCheckIn[] = [];
      let fetchedMoments: PulseMoment[] = [];
      
      try {
        [fetchedShares, fetchedPings, fetchedPins, fetchedNotifs, fetchedCheckIns, fetchedMoments] = await Promise.all([
          api.getShares(nextCircleId),
          api.getPings(nextCircleId),
          api.getMemoryPins(nextCircleId),
          api.getNotifications(nextCircleId),
          api.getSafetyCheckIns(nextCircleId),
          api.getMoments(nextCircleId),
        ]);
      } catch (err: any) {
        if (err.status === 401) {
          console.error('Authentication error loading data, user may need to re-authenticate');
          // Set empty arrays to prevent UI crashes
          fetchedShares = [];
          fetchedPings = [];
          fetchedPins = [];
          fetchedNotifs = [];
          fetchedCheckIns = [];
          fetchedMoments = [];
        } else {
          throw err;
        }
      }

      setShares(fetchedShares);
      setPings(fetchedPings);
      setMemoryPins(fetchedPins);
      setNotifications(fetchedNotifs);
      setSafetyCheckIns(fetchedCheckIns);
      setMoments(fetchedMoments);
      notificationIdsRef.current = new Set(fetchedNotifs.map((notification) => notification.id));
    } catch {
      setCurrentUser(null);
      setCircles([]);
      setShares([]);
      setPings([]);
      setMemoryPins([]);
      setNotifications([]);
      setSafetyCheckIns([]);
      setMoments([]);
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
      try {
        const event = JSON.parse(message.data) as {
          ping?: Ping;
          notification?: NotificationItem;
          share?: LocationShare;
          checkIn?: SafetyCheckIn;
          moment?: PulseMoment;
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
        if (event.checkIn) {
          setSafetyCheckIns((current) => [event.checkIn!, ...current.filter((item) => item.id !== event.checkIn!.id)]);
        }
        if (event.moment) {
          setMoments((current) => [event.moment!, ...current.filter((item) => item.id !== event.moment!.id)]);
        }
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
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
  const activeUserCheckIn = safetyCheckIns.find(
    (checkIn) => checkIn.userId === currentUserId && checkIn.status === 'active'
  );

  useEffect(() => {
    if (!activeUserShare || !navigator.geolocation) return undefined;

    let lastSent: { latitude: number; longitude: number; at: number } | null = null;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const movedEnough = !lastSent || Math.abs(latitude - lastSent.latitude) > 0.0001 || Math.abs(longitude - lastSent.longitude) > 0.0001;
        const waitedEnough = !lastSent || Date.now() - lastSent.at > 10000;
        if (!movedEnough && !waitedEnough) return;

        lastSent = { latitude, longitude, at: Date.now() };
        void api.updateLocation(activeUserShare.id, { latitude, longitude }).then((updatedShare) => {
          setShares((current) => current.map((share) => share.id === updatedShare.id ? updatedShare : share));
        });
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeUserShare?.id]);

  const handleStartShare = async (
    durationMinutes: number,
    label?: string,
    lat?: number,
    lng?: number
  ) => {
    const coords = lat !== undefined && lng !== undefined
      ? { lat, lng }
      : await new Promise<{ lat: number; lng: number }>((resolve) => {
          if (!navigator.geolocation) {
            resolve({ lat: 14.599512, lng: 120.984222 });
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => resolve({ lat: 14.599512, lng: 120.984222 }),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
          );
        });
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

  const handleSendPing = async (message: string, attachLocation: boolean, lat?: number, lng?: number) => {
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (attachLocation) {
      if (lat !== undefined && lng !== undefined) {
        latitude = lat;
        longitude = lng;
      } else if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          });
        });
        latitude = position?.coords.latitude;
        longitude = position?.coords.longitude;
      }
    }

    await api.sendPing({
      circleId: activeCircleId,
      message,
      latitude,
      longitude,
    });
    await loadData();
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllRead(activeCircleId);
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const handleEnableDeviceAlerts = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('This browser does not support device alerts.');
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Device alert permission was not granted.');
    const { publicKey } = await api.getPublicKey();
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidKey(publicKey),
    });
    await api.subscribe(subscription.toJSON());
  };

  const handleStartSafetyCheckIn = async (durationMinutes: number) => {
    const checkIn = await api.startSafetyCheckIn(activeCircleId, durationMinutes);
    setSafetyCheckIns((current) => [checkIn, ...current.filter((item) => item.userId !== currentUserId || item.status !== 'active')]);
  };

  const handleCompleteSafetyCheckIn = async (checkInId: string) => {
    const checkIn = await api.completeSafetyCheckIn(checkInId);
    setSafetyCheckIns((current) => current.map((item) => item.id === checkIn.id ? checkIn : item));
  };

  const handleCreateMoment = async (title: string, place: string, startsAt: string) => {
    const moment = await api.createMoment({ circleId: activeCircleId, title, place, startsAt });
    setMoments((current) => [moment, ...current.filter((item) => item.id !== moment.id)]);
  };

  const handleSaveMemoryPin = async (
    caption: string,
    emoji: string,
    lat: number,
    lng: number
  ) => {
    const placeName = await getFriendlyPlaceName(lat, lng);
    await api.createMemoryPin({
      circleId: activeCircleId,
      caption,
      emoji,
      latitude: lat,
      longitude: lng,
      placeName,
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
    safetyCheckIns,
    activeUserCheckIn,
    moments,
    realtimeStatus,
    activeUserShare,
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
    handleRegisterSuccess,
    loadData,
  };
}
