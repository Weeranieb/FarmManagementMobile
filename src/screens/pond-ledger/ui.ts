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
import i18n from '@/locale/i18n';

export type IconName = keyof typeof Icon;

type Theme = ReturnType<typeof useTheme>['t'];
type Mode = ReturnType<typeof useTheme>['mode'];

/** Fixed width of the day column; the five value columns share the rest (flex). */
export const DAY_W = 46;
/** Every day row is the same height so the grid reads as an even ledger —
 *  emphasis for logged days comes from value weight/size/colour, not height. */
export const ROW_H = 44;

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
export const LEDGER_GROUPS: {
  group: GroupKey;
  /** i18next keys — resolved in the header component so a language switch
   *  re-renders the labels (a module-scope string would freeze at first load). */
  titleKey: string;
  unitKey: string;
  span: number;
}[] = [
  { group: 'pellet', titleKey: 'daily.pelletFeed', unitKey: 'unit.bag', span: 2 },
  { group: 'fresh', titleKey: 'daily.freshFeed', unitKey: 'unit.crate', span: 1 },
  { group: 'death', titleKey: 'daily.deathShort', unitKey: 'unit.fish', span: 1 },
  { group: 'catch', titleKey: 'daily.catchShort', unitKey: 'unit.fish', span: 1 },
];

/**
 * Both lists above describe every column the ledger can show. Filter them for
 * the current client before rendering — ตกปลา is a per-client activity
 * (`Client.isTouristFishingEnabled`), and hiding it in the daily log while the
 * ledger still shows it would just move the inconsistency rather than fix it.
 */
export function visibleLedgerGroups(touristFishingEnabled: boolean): typeof LEDGER_GROUPS {
  return touristFishingEnabled ? LEDGER_GROUPS : LEDGER_GROUPS.filter((g) => g.group !== 'catch');
}

export function visibleLedgerLeaves(touristFishingEnabled: boolean): typeof LEDGER_LEAVES {
  return touristFishingEnabled ? LEDGER_LEAVES : LEDGER_LEAVES.filter((l) => l.key !== 'cat');
}

/** Leaf columns in table order, with the sub-label shown under pellet. */
export const LEDGER_LEAVES: { key: ColKey; group: GroupKey; leafKey: string | null }[] = [
  { key: 'pm', group: 'pellet', leafKey: 'daily.morning' },
  { key: 'pe', group: 'pellet', leafKey: 'daily.evening' },
  { key: 'fresh', group: 'fresh', leafKey: null },
  { key: 'death', group: 'death', leafKey: null },
  { key: 'cat', group: 'catch', leafKey: null },
];

/** Format a ledger cell — integers bare, one decimal otherwise. Returns null
 *  when there's nothing to show: absent (`''`/null) OR zero. The farmer's paper
 *  ledger leaves untouched cells blank rather than writing a wall of 0s, so day
 *  rows render a faint "–" for zeros; the totals row + stat strip re-add an
 *  explicit "0" via `?? '0'` where a running total genuinely reads as zero. */
export function fmtCell(v: number | '' | null | undefined): string | null {
  if (v === '' || v == null) return null;
  const num = Number(v);
  if (!Number.isFinite(num) || num === 0) return null;
  return num % 1 === 0 ? String(num) : num.toFixed(1);
}

export type EventTone = { soft: string; ink: string; dot: string; label: string; icon: IconName };

export function eventTone(mode: PondActivityModel['mode'], t: Theme): EventTone {
  switch (mode) {
    case 'fill':
      return { soft: t.fillSoft, ink: t.fillInk, dot: t.fill, label: i18n.t('activity.fill'), icon: 'plus' };
    case 'move':
      return { soft: t.moveSoft, ink: t.moveInk, dot: t.move, label: i18n.t('activity.move'), icon: 'swap' };
    default:
      return { soft: t.sellSoft, ink: t.sellInk, dot: t.sell, label: i18n.t('activity.sell'), icon: 'tag' };
  }
}

/** One-line human summary for an activity threaded under its day. */
export function activityText(a: PondActivityModel): string {
  if (a.mode === 'sell') {
    const parts = [`${fmt.num(a.amount)} ${i18n.t('unit.kg')}`];
    if (a.total) parts.push(fmt.baht(a.total));
    if (a.merchant) parts.push(a.merchant);
    return parts.join(' · ');
  }
  if (a.mode === 'move') {
    const dest = a.direction === 'out' ? a.toPondName : a.fromPondName;
    const arrow = a.direction === 'out' ? '→' : '←';
    const head = `${fmt.num(a.amount)} ${i18n.t('unit.fish')}`;
    return `${head}${dest ? ` ${arrow} ${dest}` : ''}`;
  }
  return `${fmt.num(a.amount)} ${i18n.t('unit.fish')}`;
}
