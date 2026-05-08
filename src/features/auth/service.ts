import { http } from '@/shared/http';
import type { LoginRequest, LoginResponse } from './types';

export function login(body: LoginRequest): Promise<LoginResponse> {
  return http.post('/auth/login', body);
}

export function logout(): Promise<void> {
  return http.post('/auth/logout');
}
