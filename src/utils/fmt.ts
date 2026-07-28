// Number formatters — ported from "Farm OS/primitives.jsx" `window.fmt`.
//
// Unit suffixes and domain names read from i18next directly rather than taking a
// `t` argument: these are called from deep inside render trees and from plain
// helpers, and threading `t` through every caller would touch most of the app.
// The trade-off is that a language switch only refreshes them when the calling
// component re-renders — which it does, since every screen now reads at least
// one key through `useTranslation`.

import i18n from '@/locale/i18n';
import { TH_MONTH_NAMES_SHORT } from '@/locale/thaiDate';

const EN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const fmt = {
  num: (n: number | null | undefined): string => (n ?? 0).toLocaleString('en-US'),
  kg: (n: number | string): string =>
    `${Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 })} ${i18n.t('unit.kg')}`,
  baht: (n: number | string): string => `฿${Math.round(Number(n)).toLocaleString('en-US')}`,
  bahtPrecise: (n: number | string): string =>
    `฿${Number(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  /** Baht with an explicit sign (U+2212 minus), thousands-separated, rounded.
   *  Sign is decided AFTER rounding so a value like −0.4 shows "+฿0", not "−฿0". */
  signedBaht: (n: number): string => {
    const rounded = Math.round(n);
    const sign = rounded < 0 ? '−' : '+';
    return `${sign}฿${Math.abs(rounded).toLocaleString('en-US')}`;
  },
  /**
   * A day, in the current UI language — "27 ก.ค. 2569" / "27 Jul 2025".
   *
   * The rest of the app formats dates through `thaiDate`, which is Thai-only by
   * design; that gap is still open. This exists for dates rendered inside
   * already-translated copy, where a Thai month in an English sentence reads as
   * a bug. Returns null for a missing or unparseable value so callers can fall
   * back to language that doesn't claim a date.
   */
  day: (iso: string | null | undefined): string | null => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    if (i18n.language?.startsWith('th')) {
      return `${d.getDate()} ${TH_MONTH_NAMES_SHORT[d.getMonth()]} ${d.getFullYear() + 543}`;
    }
    return `${d.getDate()} ${EN_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  },
};

/** Fish-type codes the backend sends. */
export const FISH_CODES = ['nil', 'kaphong', 'kang', 'duk'] as const;

/**
 * Localized fish name by backend code, e.g. `FISH_TH['nil']`.
 *
 * Kept as an index-able object (not a `fishLabel(code)` call) so the
 * `FISH_TH[code] ?? code` idiom at every call site keeps working — the lookup
 * just resolves through i18next now. An unknown code returns undefined, so those
 * fallbacks still show the raw code.
 */
export const FISH_TH: Record<string, string> = new Proxy(
  {},
  {
    get(_target, key) {
      if (typeof key !== 'string') return undefined;
      const label = i18n.t(`fish.${key}`, { defaultValue: '' });
      return label || undefined;
    },
    has: (_t, key) => (FISH_CODES as readonly string[]).includes(String(key)),
    ownKeys: () => [...FISH_CODES],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  },
);

/** Strip a display prefix the data may already carry (legacy rows store it). */
function stripPrefix(raw: string, thaiPrefix: string): string {
  return raw.startsWith(thaiPrefix) ? raw.slice(thaiPrefix.length).trim() : raw;
}

/** Prefix a farm name for display — "ฟาร์ม 1" / "Farm 1". */
export function displayFarmName(name: string | null | undefined): string {
  const prefix = i18n.t('unit.farmPrefix');
  const bare = stripPrefix((name ?? '').trim(), 'ฟาร์ม');
  return bare ? `${prefix} ${bare}` : prefix;
}

/** Prefix a pond name for display — "บ่อ A2" / "Pond A2". */
export function displayPondName(name: string | null | undefined): string {
  const prefix = i18n.t('unit.pondPrefix');
  const bare = stripPrefix((name ?? '').trim(), 'บ่อ');
  return bare ? `${prefix} ${bare}` : prefix;
}
