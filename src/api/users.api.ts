import { apiFetch } from './client';
import { UserProfile } from '../types';

export const usersApi = {
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
  deleteAccount: () =>
    apiFetch<{ success: boolean }>('/api/user/account', {
      method: 'DELETE',
    }),
};
