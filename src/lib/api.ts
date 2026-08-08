import {
  UserProfile,
  Circle,
  LocationShare,
  Ping,
  MemoryPin,
  NotificationItem,
} from '../types';

let currentActiveUserId = typeof localStorage !== 'undefined' ? (localStorage.getItem('pulse_user_id') || '') : '';

export function setApiActiveUserId(userId: string) {
  currentActiveUserId = userId;
}

export function getApiActiveUserId() {
  return currentActiveUserId;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-id', currentActiveUserId);

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    throw new Error(`Server error HTTP ${response.status}`);
  }

  if (!isJson) {
    throw new Error(`Invalid non-JSON response from ${endpoint}`);
  }

  return response.json();
}

export const api = {
  // Users
  getUsers: () => apiFetch<UserProfile[]>('/api/users'),
  getMe: () => apiFetch<UserProfile>('/api/auth/me'),
  updateMe: (data: { displayName?: string; email?: string; avatarColor?: string }) =>
    apiFetch<UserProfile>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  registerUser: (data: { displayName: string; email: string; avatarColor?: string }) =>
    apiFetch<UserProfile>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Circles
  getCircles: () => apiFetch<Circle[]>('/api/circles'),
  createCircle: (data: { name: string }) =>
    apiFetch<Circle>('/api/circles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  joinCircle: (data: { inviteCode: string }) =>
    apiFetch<Circle>('/api/circles/join', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Location Shares
  getShares: (circleId?: string) =>
    apiFetch<LocationShare[]>(`/api/shares${circleId ? `?circleId=${circleId}` : ''}`),
  startShare: (data: {
    circleId: string;
    latitude: number;
    longitude: number;
    durationMinutes: number;
    label?: string;
  }) =>
    apiFetch<LocationShare>('/api/shares', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  stopShare: (shareId: string) =>
    apiFetch<{ success: boolean }>(`/api/shares/${shareId}`, {
      method: 'DELETE',
    }),
  updateLocation: (shareId: string, data: { latitude: number; longitude: number }) =>
    apiFetch<LocationShare>(`/api/shares/${shareId}/location`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Pings
  getPings: (circleId?: string) =>
    apiFetch<Ping[]>(`/api/pings${circleId ? `?circleId=${circleId}` : ''}`),
  sendPing: (data: {
    circleId: string;
    message: string;
    latitude?: number;
    longitude?: number;
  }) =>
    apiFetch<Ping>('/api/pings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Memory Pins
  getMemoryPins: (circleId?: string) =>
    apiFetch<MemoryPin[]>(`/api/memory-pins${circleId ? `?circleId=${circleId}` : ''}`),
  createMemoryPin: (data: {
    circleId: string;
    latitude: number;
    longitude: number;
    caption: string;
    emoji?: string;
  }) =>
    apiFetch<MemoryPin>('/api/memory-pins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteMemoryPin: (pinId: string) =>
    apiFetch<{ success: boolean }>(`/api/memory-pins/${pinId}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: (circleId?: string) =>
    apiFetch<NotificationItem[]>(
      `/api/notifications${circleId ? `?circleId=${circleId}` : ''}`
    ),

  // Account
  deleteAccount: () =>
    apiFetch<{ success: boolean }>('/api/user/account', {
      method: 'DELETE',
    }),
};
