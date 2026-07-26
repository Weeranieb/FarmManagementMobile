import { createMMKV } from 'react-native-mmkv';

/**
 * App-wide synchronous key/value store (JSI/Nitro-backed, ~30× faster than
 * AsyncStorage). Non-sensitive data only — auth token & user profile stay in
 * expo-secure-store (see src/features/auth/store.ts). Can be encrypted later
 * via `createMMKV({ id, encryptionKey })` if we ever cache PII here.
 */
export const storage = createMMKV({ id: 'farmos' });

/**
 * Read a JSON blob written by `writeJson`. Returns null when the key is absent
 * or holds unparseable text — persisted data outlives app versions, so a
 * corrupt or stale blob must degrade to "nothing saved", never throw.
 */
export function readJson<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Write a JSON blob. Failures (full disk) are logged rather than thrown:
 * callers write from effects, where a throw would tear down the screen the
 * user is typing into — losing more than the failed write.
 */
export function writeJson(key: string, value: unknown): void {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (err) {
    console.log('[mmkv] write failed', key, err);
  }
}

export function removeKey(key: string): void {
  storage.remove(key);
}

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
