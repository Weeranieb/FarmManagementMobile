// Layout + column constants for the farm-wide Daily Log v6 screen.
// Mirrors the prototype in `Daily Log v6.html` (lines 187-201 + 341-342).

import { TH_MONTH_NAMES_FULL, TH_MONTH_NAMES_SHORT, TH_WEEKDAYS_SHORT } from '@/locale/thaiDate';
import i18n from '@/locale/i18n';

// The table fits the viewport — no horizontal pan. Only the pond-identity
// column is a fixed width; the five data columns share whatever is left via
// `flex: 1`, so the grid is correct on a 360pt Android, a 375pt SE, and inside
// the tablet's narrower pane without any per-device math.
//
// Sizing sanity check (the reason nothing needs to be squeezed): every cell is
// capped at `CELL_MAX_VALUE` with ≤2 decimals, so the widest string the grid can
// ever render is "14.25" — ~40px at the 16px numeric face. The narrowest column
// this layout produces is (360 − NAME_W) / 5 ≈ 56px, leaving ~48px of usable
// width after padding. Values keep their full size; they are not shrunk to fit.
export const NAME_W = 78;
/** Horizontal padding inside a data cell. Kept small because values are
 *  centered — the pill overlay (TableRow) provides the visual inset. */
export const CELL_PAD_H = 4;
export const ROW_H = 54;

/** Header band-row height. Sized for an 11.5px Thai label at lineHeight 18 —
 *  "เหยื่อสด" stacks two marks over the same base and needs the headroom. */
export const HEADER_BAND_H = 32;
/** Header leaf-row height (sub-label / unit line). */
export const HEADER_LEAF_H = 24;

/** Day-strip pill height — keep in sync with DayStripRow Pressable. */
export const DAY_PILL_H = 52;
/** Vertical padding above/below pills inside the day strip. */
export const DAY_STRIP_PAD_V = 8;
/** Extra room so pill shadows are not clipped by CollapsingChrome overflow. */
export const DAY_STRIP_SHADOW_SLACK = 4;

export const CHROME = {
  title: 56,
  farm: 48,
  month: 40,
  day: DAY_STRIP_PAD_V * 2 + DAY_PILL_H + DAY_STRIP_SHADOW_SLACK,
} as const;

/** Scrollable chrome only (title lives in AppBar, outside the ScrollView). */
export const CHROME_SCROLL = CHROME.farm + CHROME.month + CHROME.day;
/** @deprecated Use CHROME_SCROLL for onScroll collapse math. */
export const CHROME_TOTAL = CHROME_SCROLL;

/** Numpad keypad — fixed row height (comfortable, gloves-in-sun tap target,
 *  well above the 44pt minimum) and inter-row gap. The keypad sizes to its
 *  rows instead of stretching to fill a fraction of the screen, so the sheet
 *  stays as short as its content. */
export const NUMPAD_KEY_ROW_H = 44;
export const NUMPAD_KEY_ROW_GAP = 6;

/**
 * Estimated numpad bottom-sheet height, now that the sheet is content-driven
 * (grabber + header + 4 key rows + footer + home-indicator inset) rather than
 * a fixed fraction of the screen. Used by the daily-log view to lift the last
 * table rows above the open sheet; an estimate is fine — it only sets the
 * scroll-to-reveal target, and the validation hint (when shown) adds a little
 * on top. Keep the piece sums in sync with Numpad's layout.
 */
export function numpadSheetHeight(insetBottom: number): number {
  const GRABBER = 10; // paddingTop 6 + dot 4
  const HEADER = 58; // single row: paddingTop 4 + label+value stack ~46 + paddingBottom 8
  const KEYPAD = NUMPAD_KEY_ROW_H * 4 + NUMPAD_KEY_ROW_GAP * 3;
  const FOOTER = 58; // paddingTop 8 + button 44 + paddingBottom 10
  return GRABBER + HEADER + KEYPAD + FOOTER + insetBottom;
}

export type ColKey = 'pm' | 'pe' | 'fresh' | 'death' | 'cat';
export type GroupKey = 'pellet' | 'fresh' | 'death' | 'catch';

export const COLS: readonly {
  key: ColKey;
  group: GroupKey;
  /** Localized sub-label under the pellet group; '' where the group label
   *  already says it. Read through i18next so a language switch applies. */
  readonly leaf: string;
  integer?: boolean;
}[] = [
  {
    key: 'pm',
    group: 'pellet',
    get leaf() {
      return i18n.t('daily.morning');
    },
  },
  {
    key: 'pe',
    group: 'pellet',
    get leaf() {
      return i18n.t('daily.evening');
    },
  },
  { key: 'fresh', group: 'fresh', leaf: '' },
  { key: 'death', group: 'death', leaf: '', integer: true },
  { key: 'cat', group: 'catch', leaf: '', integer: true },
];


export type GroupMeta = {
  title: string;
  unit: string;
  tint: string;
  edge: string;
  ink: string;
};

/** Group bands. `title`/`unit` resolve through i18next on read (getters) so the
 *  table header and keypad follow a language switch without re-plumbing props. */
export const GROUP_LIGHT: Record<GroupKey, GroupMeta> = {
  pellet: {
    get title() {
      return i18n.t('daily.pelletFeed');
    },
    // Pellet is logged by bag (ถุง), same as fresh is by crate (ลัง) — not by kg.
    get unit() {
      return i18n.t('unit.bag');
    },
    tint: '#eef4ff',
    edge: '#d9e6fb',
    ink: '#1f4cb0',
  },
  fresh: {
    get title() {
      return i18n.t('daily.freshFeed');
    },
    get unit() {
      return i18n.t('unit.crate');
    },
    tint: '#ecf7ee',
    edge: '#cfe7d4',
    ink: '#216c34',
  },
  death: {
    get title() {
      return i18n.t('daily.deaths');
    },
    get unit() {
      return i18n.t('unit.fish');
    },
    tint: '#fdf3df',
    edge: '#efdcae',
    ink: '#8a5a04',
  },
  catch: {
    get title() {
      return i18n.t('daily.catchShort');
    },
    get unit() {
      return i18n.t('unit.fish');
    },
    tint: '#f1f3f9',
    edge: '#dde1ec',
    ink: '#4a5675',
  },
};

export const thDow = (dayIndex: number): string => TH_WEEKDAYS_SHORT[dayIndex] ?? '';
export const thMonth = (monthIndex: number): string => TH_MONTH_NAMES_FULL[monthIndex] ?? '';
export const thMonthAbbr = (monthIndex: number): string => TH_MONTH_NAMES_SHORT[monthIndex] ?? '';

export const fmtTh = (n: number | '' | null | undefined): string => {
  if (n === '' || n == null) return '';
  return Number(n).toLocaleString('th-TH', { maximumFractionDigits: 2 });
};

// Feed options come from `useFeedCollectionsData` filtered by `kind`.
// The picker formats `name` + price into the displayed row.

/**
 * Vibrant-blue brand palette used by this screen only, lifted from the
 * v6 design tokens. The project-wide `t.brand` is a calmer teal; the
 * daily-log design specifically calls for the saturated blue accents
 * (selected day pill, save CTA, active cell highlight) so we override
 * here without touching the global theme.
 */
export const VIBRANT_BRAND = {
  50: '#e8f0ff',
  100: '#cfdfff',
  500: '#3a78ea',
  600: '#1f5fd4',
  700: '#1849b0',
} as const;

/**
 * Neutral cool greys for the table surfaces — design tokens `--surface`,
 * `--zebra`, and `--paper-2`. The project-wide theme leans warm cream
 * (`surface #fff`, `surfaceAlt #f6f5f1`, `surfaceSunk #f2f0ec`), which
 * clashes with the cool group tints (blue / green / amber / slate). The
 * daily-log table opts into the design's cool palette here.
 */
export const TABLE_SURFACE = {
  even: '#ffffff',
  zebra: '#fafbfd',
} as const;

/**
 * Neutral cool-grey palette for `status === 'maintenance'` rows. Chosen to
 * read as "locked / out of cycle" — distinct from "active but empty" (which
 * uses the saved/dirty stripe colors) and from the warmer `disabled` zebra
 * used for ponds whose cycle hasn't started yet. Spec: Daily Log v7 frames
 * P / Q, callout at lines 1697-1699.
 */
export const MAINT = {
  /** Row background — kept close to white so locked rows recede and the
   *  editable rows above them lead the eye. */
  bg: '#f5f6f9',
  /** Pond name cell text color before opacity is applied. */
  ink: '#5d6a85',
  /** Central lock-icon color in the data columns. */
  inkSoft: '#98a2b5',
  /** Accent stripe on the row's left edge (replaces saved/dirty/empty). */
  accent: '#c2c8d6',
  /** Cell border + pill border tint. */
  stroke: 'rgba(124,140,170,.12)',
  /** Pill background under the pond code. */
  pillBg: 'rgba(124,140,170,.14)',
} as const;

/**
 * Cell-highlight palette used by the active-cell pill overlay (frames Y / Z /
 * AA in Daily Log v7). The active cell paints a 2px border + soft tint + outer
 * ring so the in-edit cell remains legible regardless of the keypad position.
 * `default` is the brand-blue treatment; `error` swaps to a red equivalent and
 * is reserved for value validation (not wired yet — TableRow accepts the prop
 * shape now so the visual is ready when the validator lands).
 */
export const CELL_HIGHLIGHT = {
  ring: 'rgba(31,95,212,.18)',
  tint: 'rgba(31,95,212,.07)',
  border: '#1f5fd4',
  errorRing: 'rgba(220,42,42,.15)',
  errorTint: 'rgba(220,42,42,.07)',
  errorBorder: '#dc2a2a',
  errorInk: '#9b1c1c',
} as const;

export type CellHighlightVariant = 'default' | 'error';

/**
 * Maximum value accepted for any single data cell. Anything strictly greater
 * is flagged as a validation error (red pill + `!` badge, Daily Log v7 frame
 * AA). The v7 prototype uses 500 specifically for the death column ("ค่าต้อง
 * อยู่ระหว่าง 0–500 ตัว"), but the user has asked for a uniform 100 ceiling
 * across every column for now — easy to swap to per-column limits later by
 * promoting this to a `Record<ColKey, number>`.
 */
export const CELL_MAX_VALUE = 100;

export function isCellValueInvalid(value: number | '' | null | undefined): boolean {
  if (value === '' || value == null) return false;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  return n > CELL_MAX_VALUE;
}
