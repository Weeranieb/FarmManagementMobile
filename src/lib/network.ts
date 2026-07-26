// Connectivity signal for the app: drives React Query's `onlineManager` and the
// offline banner.
//
// React Native has no built-in online/offline event, so without this React Query
// assumes the device is always online: every query fires into a dead socket while
// out of signal, and nothing refetches when signal returns. Wiring expo-network
// into `onlineManager` gives us both — queries pause instead of failing, then
// resume on reconnect.
//
// Mutations deliberately keep the always-fire behaviour (`networkMode: 'always'`
// in src/app/_layout.tsx): a paused mutation never settles, which would hang the
// daily-log save behind a spinner. Failing fast is what lets the editors report
// "no signal — your entry is saved on this phone" while the drafts in
// features/daily-log/drafts.ts hold the data.

import { useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { onlineManager } from '@tanstack/react-query';

/**
 * `isInternetReachable` is the stricter signal (Android can be attached to a
 * network that routes nowhere) but it's optional and undefined before the first
 * probe resolves. Fall back to `isConnected`, then assume online — treating an
 * unknown state as offline would pause every query on a healthy connection.
 */
function toOnline(state: Network.NetworkState): boolean {
  return state.isInternetReachable ?? state.isConnected ?? true;
}

/**
 * Point `onlineManager` at OS connectivity. Called once from the root layout.
 *
 * React Query re-runs this setup whenever its listener count goes 0 → 1, so the
 * subscription is re-established on its own after every idle period — nothing
 * here needs to be torn down by the caller.
 */
export function startNetworkWatcher(): void {
  onlineManager.setEventListener((setOnline) => {
    // Prime from the current state — the listener only fires on *changes*, so a
    // cold start in airplane mode would otherwise look online until the user
    // toggled something.
    void Network.getNetworkStateAsync()
      .then((state) => setOnline(toOnline(state)))
      .catch(() => {
        // Probe failed (permission, emulator quirk) — stay optimistic rather
        // than locking the app into a paused-query state it can't leave.
        setOnline(true);
      });

    try {
      const sub = Network.addNetworkStateListener((state) => setOnline(toOnline(state)));
      return () => sub.remove();
    } catch (err) {
      // expo-network is a native module, so a JS bundle that reaches a dev
      // client built before it was added throws right here — at module scope of
      // the root layout, i.e. a white screen. Degrade to "assume online"
      // (pre-wiring behaviour) and say why in the log instead.
      console.log('[network] expo-network unavailable — rebuild the dev client', err);
      setOnline(true);
      return undefined;
    }
  });
}

/** Reactive read of the same signal, for UI that reports connectivity. */
export function useIsOnline(): boolean {
  const [online, setOnline] = useState(() => onlineManager.isOnline());
  useEffect(() => onlineManager.subscribe(setOnline), []);
  return online;
}
