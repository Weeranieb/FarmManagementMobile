import { createMMKV } from 'react-native-mmkv';

/**
 * App-wide synchronous key/value store (JSI/Nitro-backed, ~30× faster than
 * AsyncStorage). Non-sensitive data only — auth token & user profile stay in
 * expo-secure-store (see src/features/auth/store.ts). Can be encrypted later
 * via `createMMKV({ id, encryptionKey })` if we ever cache PII here.
 */
export const storage = createMMKV({ id: 'farmos' });

/**
 * Sync `Storage`-shaped adapter for @tanstack/query-sync-storage-persister.
 * Maps MMKV's getString/set/remove onto the getItem/setItem/removeItem API the
 * persister expects.
 */
export const mmkvPersistStorage = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => storage.set(key, value),
  removeItem: (key: string): void => {
    storage.remove(key);
  },
};
