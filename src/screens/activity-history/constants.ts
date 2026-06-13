// ───────────────────────────────────────────────────────────────────────────
// ประวัติกิจกรรม — full activity history.
//
// Reached from "ดูประวัติทั้งหมด" on the Home กิจกรรมล่าสุด section. Same
// honesty rules as Home (Farm OS/Home Redesign.html § ④):
//   · Discrete user-authored events only (เติม/ย้าย/ขาย — ซื้อ in a future
//     phase). Daily-log saves are excluded — they happen every day on every
//     pond and would bury the real events.
//   · The only affordance beyond the list is a client-side type filter — a
//     pure Array.filter over rows we already hold. No search, no analytics.
// ───────────────────────────────────────────────────────────────────────────

import type { ActivityKind } from '@/screens/home/components/activity-row';

export type FilterId = 'all' | ActivityKind;

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'fill', label: 'เติม' },
  { id: 'move', label: 'ย้าย' },
  { id: 'sell', label: 'ขาย' },
  // ซื้อ (buy) is deferred to a future phase — no chip until the buy flow ships.
  // `counts.buy` / KIND_LABEL.buy stay defined so a buy row still renders under
  // ทั้งหมด if the feed ever returns one.
];

/** Full-word labels for the app-bar subtitle and filtered-empty state. */
export const KIND_LABEL: Record<ActivityKind, string> = {
  feed: 'บันทึกประจำวัน',
  fill: 'เติมปลา',
  move: 'ย้ายปลา',
  sell: 'ขายปลา',
  buy: 'ซื้อปลา',
};

// Filter logs in dev: `npx react-native log-ios | grep \[ActivityHistory\]`
export const log = (...args: unknown[]) => console.log('[ActivityHistory]', ...args);
