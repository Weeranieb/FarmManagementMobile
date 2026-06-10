import type { ActivityItem } from './components/activity-row';

// ───────────────────────────────────────────────────────────────────────────
// Phase-1 Home — honest mock data.
//
// Every number on this screen is derivable from endpoints Phase 1 actually
// exposes: /ponds, /dailyLog?date=today, /activity?limit=10. No anomalies,
// no harvest-readiness, no aggregate insights.
// ───────────────────────────────────────────────────────────────────────────

export type PendingPond = {
  /** Pond ID — tap a chip to deep-link Daily Log to this pond. */
  id: number;
  name: string;
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

const PENDING_DEFAULT: PendingPond[] = [
  { id: 11, name: 'บ่อ A1', lateDays: 0 },
  { id: 13, name: 'บ่อ A3', lateDays: 0 },
  { id: 14, name: 'บ่อ B1', lateDays: 2 },
  { id: 15, name: 'บ่อ B2', lateDays: 0 },
  { id: 21, name: 'บ่อ 1', lateDays: 0 },
  { id: 23, name: 'บ่อ 3', lateDays: 1 },
];

export const HOME_DIGEST_DEFAULT: HomeDigest = {
  activeCount: 9,
  loggedCount: 3,
  pending: PENDING_DEFAULT,
  late: PENDING_DEFAULT.filter((p) => p.lateDays > 0),
  // Sum of active pond.totalFish from Farm OS/mock-data.js:
  //   A1 5200 + A2 8400 + A3 3100 + B1 12300 + B2 6700 + B3 6800
  //     + 1 7200 + 2 5500 + 3 5500 = 60,700
  totalFish: 60_700,
  // 3 ponds × (10 kg pellet × ฿32 + 8 kg fresh × ฿12) = 3 × 416 = ฿1,248
  feedCostToday: 1_248,
  deathsToday: 2,
};

/** State after the user returns from Daily Log having saved 3 more ponds. */
export const HOME_DIGEST_JUST_SAVED: HomeDigest = (() => {
  const justSavedNames = new Set(['บ่อ A1', 'บ่อ B1', 'บ่อ 1']);
  const pending = HOME_DIGEST_DEFAULT.pending.filter((p) => !justSavedNames.has(p.name));
  return {
    ...HOME_DIGEST_DEFAULT,
    loggedCount: HOME_DIGEST_DEFAULT.loggedCount + 3,
    pending,
    late: pending.filter((p) => p.lateDays > 0),
    feedCostToday: (HOME_DIGEST_DEFAULT.feedCostToday ?? 0) + 3 * (10 * 32 + 8 * 12),
    deathsToday: (HOME_DIGEST_DEFAULT.deathsToday ?? 0) + 1,
  };
})();

// ───────────────────────────────────────────────────────────────────────────
// Recent activity. Daily-log saves are deliberately NOT in this feed —
// they happen every day on every pond and would drown the discrete events
// (fill / move / sell / buy) that the user actually wants to scroll back to.
// ───────────────────────────────────────────────────────────────────────────

export const HOME_ACTIVITY: ActivityItem[] = [
  {
    id: 'e4',
    kind: 'sell',
    whenLabel: 'เมื่อวาน 16:00',
    pond: 'บ่อ C1',
    text: 'ขายปลานิล 312 กก. · ฿24,180',
    by: 'คุณ',
    recordType: 'sell',
    recordId: 401,
    extra: 'ร้านลุงพร · ปิดบ่อ',
  },
  {
    id: 'e5',
    kind: 'fill',
    whenLabel: 'เมื่อวาน 10:12',
    pond: 'บ่อ A3',
    text: 'เติมปลานิล 4,500 ตัว · ฿36,000',
    by: 'คุณ',
    recordType: 'fill',
    recordId: 302,
  },
  {
    id: 'e6',
    kind: 'move',
    whenLabel: '2 วันก่อน',
    pond: 'บ่อ B1 → บ่อ B2',
    text: 'ย้ายปลาคัง 800 ตัว',
    by: 'สมชาย',
    recordType: 'move',
    recordId: 201,
  },
  {
    id: 'e7',
    kind: 'sell',
    whenLabel: '3 วันก่อน',
    pond: 'บ่อ A2',
    text: 'ขายปลานิล 180 กก. · ฿13,860',
    by: 'สมชาย',
    recordType: 'sell',
    recordId: 388,
    extra: 'ร้านสมชาย ตลาดไท',
  },
  {
    id: 'e8',
    kind: 'fill',
    whenLabel: '5 วันก่อน',
    pond: 'บ่อ 3',
    text: 'เติมปลากะพง 5,500 ตัว',
    by: 'คุณ',
    recordType: 'fill',
    recordId: 295,
  },
];

// Filter logs in dev: `npx react-native log-ios | grep \[Home\]`
export const log = (...args: unknown[]) => console.log('[Home]', ...args);
