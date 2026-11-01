import { request } from './api';

export interface User {
  id: number;
  username: string;
}

export const getAuthConfig = () => request<{ guestRegister: boolean }>('/auth/config');

export const getCurrentUser = () => request<User>('/auth/me');

export const login = (username: string, password: string) =>
  request<User>('/auth/login', { method: 'POST', body: { username, password } });

export const register = (username: string, password: string) =>
  request<User>('/auth/register', { method: 'POST', body: { username, password } });

export const logout = () => request<void>('/auth/logout', { method: 'POST' });
