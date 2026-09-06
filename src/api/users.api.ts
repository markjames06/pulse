import { apiFetch, ApiError } from './client';
import { UserProfile } from '../types';

export const usersApi = {
  getMe: async () => {
    try {
      return await apiFetch<UserProfile | null>('/api/auth/session');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  loginUser: (data: { email: string; password: string }) =>
    apiFetch<UserProfile>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logoutUser: () =>
    apiFetch<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),
  updateMe: (data: { displayName?: string; email?: string; avatarColor?: string }) =>
    apiFetch<UserProfile>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  registerUser: (data: {
    displayName: string;
    email: string;
    password: string;
    avatarColor?: string;
  }) =>
    apiFetch<UserProfile>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteAccount: () =>
    apiFetch<{ success: boolean }>('/api/user/account', {
      method: 'DELETE',
    }),
};
