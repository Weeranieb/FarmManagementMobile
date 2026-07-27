import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { UserResponse } from './types';

const KEY_TOKEN = 'farmos.auth.token';
const KEY_USER = 'farmos.auth.user';
const KEY_EXPIRES_AT = 'farmos.auth.expiresAt';

/** Why a session ended without the user asking it to. Login renders this, so
 *  landing back on the sign-in form is explained rather than mysterious. */
export type SignedOutReason = 'expired';

type AuthState = {
  token: string | null;
  user: UserResponse | null;
  ready: boolean;
  signedOutReason: SignedOutReason | null;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: UserResponse, expiresAt?: string | null) => Promise<void>;
  updateUser: (patch: Partial<UserResponse>) => Promise<void>;
  /** Deliberate sign-out (profile → ออกจากระบบ). Leaves nothing to explain. */
  clear: () => Promise<void>;
  /** The session ended on its own: the backend rejected the token, or a stored
   *  expiry had already passed. Same wipe as `clear`, but login gets something
   *  to say. */
  expireSession: () => Promise<void>;
  /** Login calls this once the reason has been shown, so it doesn't linger. */
  acknowledgeSignedOut: () => void;
};

async function wipeStoredSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEY_TOKEN),
    SecureStore.deleteItemAsync(KEY_USER),
    SecureStore.deleteItemAsync(KEY_EXPIRES_AT),
  ]);
}

/** True when `iso` is a parseable instant that has already passed. Absent or
 *  unparseable means "no known expiry" — don't invent one. */
function isPast(iso: string | null): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t <= Date.now();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  ready: false,
  signedOutReason: null,
  hydrate: async () => {
    if (get().ready) return;
    try {
      const [token, userRaw, expiresAt] = await Promise.all([
        SecureStore.getItemAsync(KEY_TOKEN),
        SecureStore.getItemAsync(KEY_USER),
        SecureStore.getItemAsync(KEY_EXPIRES_AT),
      ]);

      // A token we already know is dead is worse than no token: restoring it
      // opens a full app of cached data that jumps to the login screen the
      // moment the first request comes back 401. Fail at the door instead.
      if (token != null && isPast(expiresAt)) {
        await wipeStoredSession();
        set({ token: null, user: null, ready: true, signedOutReason: 'expired' });
        return;
      }

      const user = userRaw ? (JSON.parse(userRaw) as UserResponse) : null;
      set({ token, user, ready: true });
    } catch {
      set({ ready: true });
    }
  },
  setSession: async (token, user, expiresAt) => {
    await Promise.all([
      SecureStore.setItemAsync(KEY_TOKEN, token),
      SecureStore.setItemAsync(KEY_USER, JSON.stringify(user)),
      expiresAt
        ? SecureStore.setItemAsync(KEY_EXPIRES_AT, expiresAt)
        : SecureStore.deleteItemAsync(KEY_EXPIRES_AT),
    ]);
    set({ token, user, signedOutReason: null });
  },
  updateUser: async (patch) => {
    const current = get().user;
    if (!current) return;
    const next = { ...current, ...patch };
    await SecureStore.setItemAsync(KEY_USER, JSON.stringify(next));
    set({ user: next });
  },
  clear: async () => {
    // Drop in-memory state first so AuthGate redirects right away — awaiting
    // three SecureStore deletes would hold the signed-out user on screen.
    set({ token: null, user: null, signedOutReason: null });
    await wipeStoredSession();
  },
  expireSession: async () => {
    // Guard against a burst of parallel 401s each firing this.
    if (get().token == null) return;
    set({ token: null, user: null, signedOutReason: 'expired' });
    await wipeStoredSession();
  },
  acknowledgeSignedOut: () => set({ signedOutReason: null }),
}));

/**
 * Single source of truth for whether authenticated API calls are enabled.
 * Used by every feature's `useXData` hook so the rule stays consistent.
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.token != null);
}
