import { displayFarmName, FISH_TH, fmt } from '@/utils/fmt';
import { toIsoDate } from '@/shared/time';
import type { ActivityFeedItem } from './types';

/** UI-facing model for one feed event — presentation strings precomposed
 *  the same way for the Home strip and the ประวัติกิจกรรม screen. */
export type ActivityEventModel = {
  id: number;
  kind: 'fill' | 'move' | 'sell' | 'buy';
  /** YYYY-MM-DD of the user-chosen event date — group rows by this. */
  dateKey: string;
  /** "09:24 น." when the record was saved on the event date; "บันทึกย้อนหลัง"
   *  for backdated entries (created_at's clock time would be misleading). */
  whenLabel: string;
  /** "บ่อ B1 → บ่อ B2" for moves, plain pond name otherwise. */
  pondLabel: string;
  /** "ฟาร์ม …" — the source pond's farm, a secondary disambiguating label. */
  farmLabel: string;
  /** e.g. "เติมปลานิล 4,500 ตัว · ฿36,000" — mirrors the design fixtures. */
  text: string;
  /** Raw username — compare with the signed-in user to render "คุณ". */
  byUsername: string;
  byName: string;
  merchant?: string;
};

function fishLabel(fishType: string): string {
  return FISH_TH[fishType] ?? fishType;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function composeText(a: ActivityFeedItem): string {
  const fish = fishLabel(a.fishType);
  switch (a.mode) {
    case 'fill':
      return `เติม${fish} ${fmt.num(a.amount)} ตัว · ${fmt.baht(a.total)}`;
    case 'move':
      return `ย้าย${fish} ${fmt.num(a.amount)} ตัว`;
    case 'sell':
      return a.totalWeight && a.totalWeight > 0
        ? `ขาย${fish} ${fmt.kg(a.totalWeight)} · ${fmt.baht(a.total)}`
        : `ขาย${fish} · ${fmt.baht(a.total)}`;
    case 'buy':
      return `ซื้อ${fish} ${fmt.num(a.amount)} ตัว · ${fmt.baht(a.total)}`;
  }
}

export function adaptActivityFeedItem(a: ActivityFeedItem): ActivityEventModel {
  // activityDate is date-only at UTC midnight — slice the calendar date off
  // the wire string instead of round-tripping through a local Date (which
  // would shift the day for UTC-negative zones).
  const dateKey = a.activityDate.slice(0, 10);
  const created = new Date(a.createdAt);
  const sameDay = toIsoDate(created) === dateKey;
  const whenLabel = sameDay
    ? `${pad2(created.getHours())}:${pad2(created.getMinutes())} น.`
    : 'บันทึกย้อนหลัง';

  return {
    id: a.id,
    kind: a.mode,
    dateKey,
    whenLabel,
    pondLabel: a.toPondName ? `${a.pondName} → ${a.toPondName}` : a.pondName,
    farmLabel: displayFarmName(a.farmName),
    text: composeText(a),
    byUsername: a.createdBy,
    byName: a.createdByName,
    merchant: a.merchant,
  };
}
