// Pure helpers for the Feed Price History screen — chart paths, range slicing,
// stat aggregation. Ported from "Farm OS/screens-feed-history.jsx" so the
// native screen lines up 1:1 with the design comps.

import type { FeedPriceHistoryEntry } from '@/features/feed-collection';

export type RangeId = '1m' | '3m' | '6m' | '1y' | 'all';

export const RANGES: readonly { id: RangeId; label: string }[] = [
  { id: '1m', label: '1ด' },
  { id: '3m', label: '3ด' },
  { id: '6m', label: '6ด' },
  { id: '1y', label: '1ป' },
  { id: 'all', label: 'ทั้งหมด' },
];

export function sliceByRange(
  history: FeedPriceHistoryEntry[],
  range: RangeId,
  now: Date = new Date(),
): FeedPriceHistoryEntry[] {
  if (range === 'all') return history.slice();
  const days = range === '1m' ? 30 : range === '3m' ? 90 : range === '6m' ? 183 : 365;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return history.filter((p) => new Date(p.effectiveDate) >= cutoff);
}

/** Sort price-history entries chronologically (oldest → newest). */
export function chronological(history: FeedPriceHistoryEntry[]): FeedPriceHistoryEntry[] {
  return history.slice().sort((a, b) => {
    return new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime();
  });
}

/**
 * Find the price ~`daysBack` days before `cur` so we can compute a month-over-
 * month delta. Picks the most recent entry whose date is on-or-before the
 * target window — matches the desktop semantics.
 */
export function priceAroundDaysAgo(
  chronologicalHistory: FeedPriceHistoryEntry[],
  cur: FeedPriceHistoryEntry,
  daysBack: number,
): FeedPriceHistoryEntry | null {
  const target = new Date(cur.effectiveDate);
  target.setDate(target.getDate() - daysBack);
  for (let i = chronologicalHistory.length - 1; i >= 0; i--) {
    const p = chronologicalHistory[i];
    if (!p) continue;
    if (new Date(p.effectiveDate) <= target) return p;
  }
  return null;
}

// ── Catmull-Rom → cubic bezier smoothing for the chart line ────────────────

export type Pt = { x: number; y: number };

export function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return '';
  const first = pts[0]!;
  if (pts.length === 1) return `M ${first.x},${first.y}`;
  const second = pts[1]!;
  if (pts.length === 2) return `M ${first.x},${first.y} L ${second.x},${second.y}`;
  let d = `M ${first.x},${first.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p0 = pts[i - 1] ?? p1;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

export function makeYTicks(min: number, max: number, n: number): number[] {
  const step = (max - min) / n;
  const out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(Math.round(min + step * i));
  return Array.from(new Set(out));
}

/**
 * Pick up to ~5 x-axis tick labels across the unique months in the history
 * slice. Mirrors the stride-pick algorithm from the design comp.
 */
export function makeXLabelMonths(
  data: FeedPriceHistoryEntry[],
): { tMs: number; monthIdx: number }[] {
  if (data.length === 0) return [];
  const months: { key: string; tMs: number; monthIdx: number }[] = [];
  data.forEach((d) => {
    const dt = new Date(d.effectiveDate);
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    if (!months.find((m) => m.key === key)) {
      months.push({ key, tMs: dt.getTime(), monthIdx: dt.getMonth() });
    }
  });
  const target = 5;
  const stride = Math.max(1, Math.ceil(months.length / target));
  return months
    .filter((_, i) => i % stride === 0)
    .map(({ tMs, monthIdx }) => ({ tMs, monthIdx }));
}

/** Average — no fp-safety needed; prices are always positive small numbers. */
export function average(prices: number[]): number {
  if (prices.length === 0) return 0;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}
