// Pure helpers for the Feed Price History screen — chart paths, range slicing,
// stat aggregation. Ported from "Farm OS/screens-feed-history.jsx" so the
// native screen lines up 1:1 with the design comps.

import type { FeedPriceHistoryEntry } from '@/features/feed-collection';

export type RangeId = '1m' | '3m' | '6m' | '1y' | 'all';

/** Label keys, resolved by the consumer so a language switch re-renders them. */
export const RANGES: readonly { id: RangeId; labelKey: string }[] = [
  { id: '1m', labelKey: 'feedPrice.range.1m' },
  { id: '3m', labelKey: 'feedPrice.range.3m' },
  { id: '6m', labelKey: 'feedPrice.range.6m' },
  { id: '1y', labelKey: 'feedPrice.range.1y' },
  { id: 'all', labelKey: 'common.all' },
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

// ── Monotone cubic smoothing for the chart line ────────────────────────────
// Catmull-Rom (the previous approach) isn't monotonicity-preserving, so a sharp
// price move made the line overshoot — arcing above the peak and hooking past
// the last point, showing prices that never existed. This is a monotone cubic
// Hermite spline (à la d3 `curveMonotoneX`): still smooth, but each segment
// stays within its two endpoints, so no overshoot. x is time (strictly
// increasing), which the algorithm assumes.

export type Pt = { x: number; y: number };

const sign = (x: number): number => (x < 0 ? -1 : 1);

export function smoothPath(pts: Pt[]): string {
  const n = pts.length;
  if (n === 0) return '';
  const first = pts[0]!;
  if (n === 1) return `M ${first.x},${first.y}`;
  if (n === 2) return `M ${first.x},${first.y} L ${pts[1]!.x},${pts[1]!.y}`;

  // Per-segment run and secant slope.
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const run = pts[i + 1]!.x - pts[i]!.x;
    dx[i] = run;
    slope[i] = run !== 0 ? (pts[i + 1]!.y - pts[i]!.y) / run : 0;
  }

  // Tangent at each point. Endpoints use the adjacent secant; interior points
  // use the Fritsch–Carlson clamp, forced flat (0) at local extrema so the
  // curve can't bulge past a peak/valley.
  const m: number[] = new Array(n);
  m[0] = slope[0]!;
  m[n - 1] = slope[n - 2]!;
  for (let i = 1; i < n - 1; i++) {
    const s0 = slope[i - 1]!;
    const s1 = slope[i]!;
    if (s0 * s1 <= 0) {
      m[i] = 0;
    } else {
      const h0 = dx[i - 1]!;
      const h1 = dx[i]!;
      const p = (s0 * h1 + s1 * h0) / (h0 + h1);
      m[i] = (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
    }
  }

  // Emit each Hermite segment as a cubic bezier (control points at ±h/3).
  let d = `M ${first.x.toFixed(2)},${first.y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const h = dx[i]!;
    const c1x = a.x + h / 3;
    const c1y = a.y + (m[i]! * h) / 3;
    const c2x = b.x - h / 3;
    const c2y = b.y - (m[i + 1]! * h) / 3;
    d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)}`;
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
