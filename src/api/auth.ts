import { api } from './client';
import type { LoginRequest, LoginResponse } from './types';

export const authApi = {
  login: (body: LoginRequest): Promise<LoginResponse> => api.post('/auth/login', body),
  logout: (): Promise<void> => api.post('/auth/logout'),
};
