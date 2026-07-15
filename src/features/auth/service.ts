import { http } from '@/shared/http';
import type { LoginRequest, LoginResponse, UserResponse } from './types';

export type UpdateMeRequest = {
  username: string;
  email: string | null;
  firstName: string;
  lastName: string | null;
  contactNumber: string;
};

export function login(body: LoginRequest): Promise<LoginResponse> {
  return http.post('/auth/login', body);
}

export function getMe(): Promise<UserResponse> {
  return http.get('/user');
}

export function updateMe(body: UpdateMeRequest): Promise<UserResponse> {
  return http.put('/user', body);
}

export function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  return http.put('/user/password', { currentPassword, newPassword });
}
