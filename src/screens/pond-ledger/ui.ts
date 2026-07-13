// Shared layout + tone helpers for the pond-month ledger table.
//
// Unlike the farm-wide daily-log table (which opts into a fixed light-only cool
// palette), the pond ledger derives every tint from the active theme tokens so
// it survives light / dark / outdoor. Column meaning is carried by the app's
// semantic action colors: pellet = move (blue), fresh = fill (green),
// death = warn (amber), catch = neutral.

import type { useTheme } from '@/theme/ThemeProvider';
import { warnInk } from '@/theme/ink';
import { fmt } from '@/utils/fmt';
import type { GroupKey, ColKey } from '@/screens/daily-log/constants';
import type { PondActivityModel } from '@/features/pond';
import { Icon } from '@/components/icons';

export type IconName = keyof typeof Icon;

type Theme = ReturnType<typeof useTheme>['t'];
type Mode = ReturnType<typeof useTheme>['mode'];

/** Fixed width of the day column; the five value columns share the rest (flex). */
export const DAY_W = 46;
export const ROW_H_LOGGED = 46;
export const ROW_H_EMPTY = 34;

export type GroupTone = { soft: string; ink: string; dot: string };

export function groupTone(group: GroupKey, t: Theme, mode: Mode): GroupTone {
  switch (group) {
    case 'pellet':
      return { soft: t.moveSoft, ink: t.moveInk, dot: t.move };
    case 'fresh':
      return { soft: t.fillSoft, ink: t.fillInk, dot: t.fill };
    case 'death':
      return { soft: t.warnSoft, ink: warnInk(mode, t), dot: t.warn };
    default:
      return { soft: t.surfaceAlt, ink: t.inkSoft, dot: t.inkMute };
  }
}

/** Append an alpha byte to a #rrggbb token so a whole column tint stays faint
 *  in every theme (tokens.ts emits 6-digit hex). Non-hex colors pass through. */
export function withAlpha(color: string, alpha: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? `${color}${alpha}` : color;
}

/** Faint per-column wash behind cell values — lighter in dark so it reads. */
export function colWash(group: GroupKey, t: Theme, mode: Mode): string {
  const { soft } = groupTone(group, t, mode);
  const alpha = mode === 'dark' ? '3D' : mode === 'outdoor' ? '52' : '73';
  return withAlpha(soft, alpha);
}

/** Two-tier header layout: group cells span their leaf columns via `span`. */
export const LEDGER_GROUPS: { group: GroupKey; title: string; unit: string; span: number }[] = [
  { group: 'pellet', title: 'อาหารเม็ด', unit: 'กก.', span: 2 },
  { group: 'fresh', title: 'เหยื่อสด', unit: 'ลัง', span: 1 },
  { group: 'death', title: 'ตาย', unit: 'ตัว', span: 1 },
  { group: 'catch', title: 'ตกปลา', unit: 'ตัว', span: 1 },
];

/** Leaf columns in table order, with the sub-label shown under pellet. */
export const LEDGER_LEAVES: { key: ColKey; group: GroupKey; leaf: string }[] = [
  { key: 'pm', group: 'pellet', leaf: 'เช้า' },
  { key: 'pe', group: 'pellet', leaf: 'เย็น' },
  { key: 'fresh', group: 'fresh', leaf: '' },
  { key: 'death', group: 'death', leaf: '' },
  { key: 'cat', group: 'catch', leaf: '' },
];

/** Format a ledger cell — integers bare, one decimal otherwise; null when absent. */
export function fmtCell(v: number | '' | null | undefined): string | null {
  if (v === '' || v == null) return null;
  const num = Number(v);
  if (!Number.isFinite(num)) return null;
  return num % 1 === 0 ? String(num) : num.toFixed(1);
}

export type EventTone = { soft: string; ink: string; dot: string; label: string; icon: IconName };

export function eventTone(mode: PondActivityModel['mode'], t: Theme): EventTone {
  switch (mode) {
    case 'fill':
      return { soft: t.fillSoft, ink: t.fillInk, dot: t.fill, label: 'เติมปลา', icon: 'plus' };
    case 'move':
      return { soft: t.moveSoft, ink: t.moveInk, dot: t.move, label: 'ย้ายปลา', icon: 'swap' };
    default:
      return { soft: t.sellSoft, ink: t.sellInk, dot: t.sell, label: 'ขายปลา', icon: 'tag' };
  }
}

/** One-line human summary for an activity threaded under its day. */
export function activityText(a: PondActivityModel): string {
  if (a.mode === 'sell') {
    const parts = [`${fmt.num(a.amount)} กก.`];
    if (a.total) parts.push(fmt.baht(a.total));
    if (a.merchant) parts.push(a.merchant);
    return parts.join(' · ');
  }
  if (a.mode === 'move') {
    const dest = a.direction === 'out' ? a.toPondName : a.fromPondName;
    const arrow = a.direction === 'out' ? '→' : '←';
    return `${fmt.num(a.amount)} ตัว${dest ? ` ${arrow} ${dest}` : ''}`;
  }
  return `${fmt.num(a.amount)} ตัว`;
}
