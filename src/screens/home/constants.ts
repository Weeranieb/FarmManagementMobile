// ───────────────────────────────────────────────────────────────────────────
// Home screen shared types.
//
// The digest is now assembled live in `useHomeDigest` from /farm → /pond →
// /pond/:id/daily-logs (see that hook). The old mock fixtures that used to live
// here (HOME_DIGEST_DEFAULT / _JUST_SAVED / HOME_ACTIVITY) were removed when the
// screen was wired to real data — keep this file fixture-free so a stray import
// can't quietly put fake numbers back on the home screen.
// ───────────────────────────────────────────────────────────────────────────

export type PendingPond = {
  /** Pond ID — tap a chip to deep-link Daily Log to this pond. */
  id: number;
  name: string;
  /** Farm this pond belongs to — needed so the deep link opens the pond's own
   *  farm, not the default first farm. */
  farmId: number;
  /** Farm this pond belongs to — the pending list is grouped by farm. */
  farmName: string;
  /** Days the pond has been left unlogged. 0 = today only. */
  lateDays: number;
};

export type HomeDigest = {
  activeCount: number;
  loggedCount: number;
  pending: PendingPond[];
  late: PendingPond[];
  /** Sum of stock across active ponds. */
  totalFish: number;
  /** ฿ — null when no Daily Log exists for today yet. */
  feedCostToday: number | null;
  /** Fish deaths today — null when no Daily Log exists for today yet. */
  deathsToday: number | null;
};

// Filter logs in dev: `npx react-native log-ios | grep \[Home\]`
export const log = (...args: unknown[]) => console.log('[Home]', ...args);
