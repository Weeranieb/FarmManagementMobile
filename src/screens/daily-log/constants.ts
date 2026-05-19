// Layout + column constants for the farm-wide Daily Log v6 screen.
// Mirrors the prototype in `Daily Log v6.html` (lines 187-201 + 341-342).

// Design widths derived from the v6 prototype. Pellet sub-cells (morning /
// evening) hold short numeric values like "14.5" and can be narrower than the
// fresh / death / catch columns; the user explicitly asked for them tightened.
//   NAME_W + 2 * PELLET_CELL_W + 3 * CELL_W = 86 + 132 + 264 = 482
// Still wider than the phone viewport, so the table pans horizontally.
export const NAME_W = 86;
export const CELL_W = 88;
export const PELLET_CELL_W = 66;
export const ROW_H = 54;

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

export type ColKey = 'pm' | 'pe' | 'fresh' | 'death' | 'cat';
export type GroupKey = 'pellet' | 'fresh' | 'death' | 'catch';

export const COLS: readonly {
  key: ColKey;
  group: GroupKey;
  leaf: string;
  integer?: boolean;
}[] = [
  { key: 'pm', group: 'pellet', leaf: 'เช้า' },
  { key: 'pe', group: 'pellet', leaf: 'เย็น' },
  { key: 'fresh', group: 'fresh', leaf: '' },
  { key: 'death', group: 'death', leaf: '', integer: true },
  { key: 'cat', group: 'catch', leaf: '', integer: true },
];

export function colW(key: ColKey): number {
  return key === 'pm' || key === 'pe' ? PELLET_CELL_W : CELL_W;
}

export const TABLE_W = NAME_W + COLS.reduce((acc, c) => acc + colW(c.key), 0);

export type GroupMeta = {
  title: string;
  unit: string;
  tint: string;
  edge: string;
  ink: string;
};

export const GROUP_LIGHT: Record<GroupKey, GroupMeta> = {
  pellet: { title: 'อาหารเม็ด', unit: 'kg', tint: '#eef4ff', edge: '#d9e6fb', ink: '#1f4cb0' },
  fresh: { title: 'เหยื่อสด', unit: 'kg', tint: '#ecf7ee', edge: '#cfe7d4', ink: '#216c34' },
  death: { title: 'ปลาตาย', unit: 'ตัว', tint: '#fdf3df', edge: '#efdcae', ink: '#8a5a04' },
  catch: { title: 'ตกปลา', unit: 'ตัว', tint: '#f1f3f9', edge: '#dde1ec', ink: '#4a5675' },
};

const TH_DOW_ARR = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as const;
const TH_MONTHS_ARR = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;
// Formal Thai month abbreviations (e.g. "พ.ค." not "พฤษ.") for compact
// date labels like the "เดิม 14 · 1 พ.ค." hint inside Numpad.
const TH_MONTHS_ABBR_ARR = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

export const thDow = (dayIndex: number): string => TH_DOW_ARR[dayIndex] ?? '';
export const thMonth = (monthIndex: number): string => TH_MONTHS_ARR[monthIndex] ?? '';
export const thMonthAbbr = (monthIndex: number): string => TH_MONTHS_ABBR_ARR[monthIndex] ?? '';

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
  /** Row background — sits above zebra (#fafbfd) so neighbours pop. */
  bg: '#eceff5',
  /** Pond name cell text color before opacity is applied. */
  ink: '#5d6a85',
  /** Central lock-icon color in the data columns. */
  inkSoft: '#8390a8',
  /** Accent stripe on the row's left edge (replaces saved/dirty/empty). */
  accent: '#a3acc2',
  /** Cell border + pill border tint. */
  stroke: 'rgba(124,140,170,.22)',
  /** Pill background under the pond code. */
  pillBg: 'rgba(124,140,170,.14)',
} as const;
