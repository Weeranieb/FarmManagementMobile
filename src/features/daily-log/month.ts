// Shared month/entry helpers for the daily-log surfaces (pond-detail recap +
// the pond-month ledger). Lifted out of pond-detail so both screens compute
// month keys and totals the same way.
//
// Wire/query month is CE `YYYY-MM`; พ.ศ. is display-only (applied via thaiDate).
// Both feeds are counted in their own pack unit — อาหารเม็ด in ถุง (bags),
// เหยื่อสด in ลัง (crates); neither is measured in kg.

import type { DailyLogEntry } from './types';
import { toMonthKey } from '@/shared/time';

export function monthStrFromDate(d: Date): string {
  return toMonthKey(d);
}

export function monthStrToStartDate(ym: string): Date {
  const parts = ym.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  return new Date(y, m - 1, 1);
}

export function addMonthsStr(ym: string, delta: number): string {
  const d = monthStrToStartDate(ym);
  d.setMonth(d.getMonth() + delta);
  return monthStrFromDate(d);
}

export function daysInMonthFromStr(ym: string): number {
  const d = monthStrToStartDate(ym);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Coerce anything to a finite number (0 for null/NaN) — cells arrive as unknown. */
export function num(x: unknown): number {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}

/** Pellet total for a day in bags (ถุง) — morning + evening. */
export function pelletBags(e: DailyLogEntry): number {
  return num(e.pelletMorning) + num(e.pelletEvening);
}

export type MonthStats = {
  /** อาหารเม็ด — ถุง (bags), morning + evening across the month. */
  pellet: number;
  /** เหยื่อสด — ลัง across the month. */
  fresh: number;
  /** ปลาตาย — ตัว. */
  death: number;
  /** ตกปลา — ตัว. */
  cat: number;
  /** Number of logged days (entries present). */
  days: number;
};

export function monthStatsFromEntries(entries: DailyLogEntry[]): MonthStats {
  let pellet = 0;
  let fresh = 0;
  let death = 0;
  let cat = 0;
  for (const e of entries) {
    pellet += num(e.pelletMorning) + num(e.pelletEvening);
    fresh += num(e.fresh);
    death += num(e.deathFishCount);
    cat += num(e.touristCatchCount);
  }
  return { pellet, fresh, death, cat, days: entries.length };
}
