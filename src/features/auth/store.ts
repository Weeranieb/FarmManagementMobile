import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { UserResponse } from './types';

const KEY_TOKEN = 'farmos.auth.token';
const KEY_USER = 'farmos.auth.user';

type AuthState = {
  token: string | null;
  user: UserResponse | null;
  ready: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: UserResponse) => Promise<void>;
  clear: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  ready: false,
  hydrate: async () => {
    if (get().ready) return;
    try {
      const [token, userRaw] = await Promise.all([
        SecureStore.getItemAsync(KEY_TOKEN),
        SecureStore.getItemAsync(KEY_USER),
      ]);
      const user = userRaw ? (JSON.parse(userRaw) as UserResponse) : null;
      set({ token, user, ready: true });
    } catch {
      set({ ready: true });
    }
  },
  setSession: async (token, user) => {
    await Promise.all([
      SecureStore.setItemAsync(KEY_TOKEN, token),
      SecureStore.setItemAsync(KEY_USER, JSON.stringify(user)),
    ]);
    set({ token, user });
  },
  clear: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEY_TOKEN),
      SecureStore.deleteItemAsync(KEY_USER),
    ]);
    set({ token: null, user: null });
  },
}));

/**
 * Single source of truth for "do we hit the API or fall back to mocks".
 * Used by every feature's `useXData` hook so the rule stays consistent.
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.token != null);
}
