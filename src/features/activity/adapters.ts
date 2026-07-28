import { displayFarmName, displayPondName, FISH_TH, fmt } from '@/utils/fmt';
import { toIsoDate } from '@/shared/time';
import { thaiDate } from '@/locale/thaiDate';
import type { ActivityFeedItem } from './types';

/**
 * Unformatted facts for one record — the payload behind the read-only detail
 * sheet. Numbers stay raw here (the row and the sheet render them at different
 * precision); only names and dates are pre-resolved, since those are pure
 * label work with no display variants.
 *
 * Sell caveat: an `activity` row for a sell carries no figures of its own —
 * they all live on its sell_details lines. The server sums head count and
 * derives average ฿/kg from those, but `fish` stays empty (species is per
 * size-grade, so a sale has no single one) and `avgWeightKg` stays 0.
 */
export type ActivityRecordDetail = {
  /** Activity id — the sheet fetches a sale's size-grade lines with it. */
  id: number;
  kind: 'fill' | 'move' | 'sell' | 'buy';
  /** Localised species name; '' for a sell (see the caveat above). */
  fish: string;
  /** Source pond's `ponds.id` — the sheet links to /pond/:id with it. */
  pondId: number;
  /** Source pond, "บ่อ …"-prefixed. */
  pond: string;
  /** Destination pond — moves only. */
  toPondId?: number;
  toPond?: string;
  farm: string;
  /** User-chosen event date: "25 กรกฎาคม 2569". No weekday — it earns nothing
   *  in a record view and made the least useful fact the loudest one. */
  eventDate: string;
  /** When the row was actually saved: "25 ก.ค. 69" + "20:07 น.". */
  savedDateLabel: string;
  savedTimeLabel: string;
  /** Saved on a different calendar day than the event date. */
  backdated: boolean;
  /** Author's display name — `toActivityItem` swaps in "คุณ" for the signed-in user. */
  by: string;
  /** Head count — summed from the detail lines for a sell. */
  amount: number;
  /** kg per fish, as entered. 0 for a sell. */
  avgWeightKg: number;
  /** ฿ per kg — as entered, or the derived average for a sell. */
  pricePerUnit: number;
  /** fill/move: stock cost with extras folded in. sell: gross revenue. */
  total: number;
  /** sell only — Σ sell_details.weight (kg). */
  totalWeightKg?: number;
  merchant?: string;
};

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
  /** Facts behind the row, for the read-only detail sheet. */
  detail: ActivityRecordDetail;
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
  const savedTimeLabel = `${pad2(created.getHours())}:${pad2(created.getMinutes())} น.`;
  const whenLabel = sameDay ? savedTimeLabel : 'บันทึกย้อนหลัง';

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
    detail: {
      id: a.id,
      kind: a.mode,
      fish: a.fishType ? fishLabel(a.fishType) : '',
      pondId: a.pondId,
      pond: displayPondName(a.pondName),
      toPondId: a.toPondId,
      toPond: a.toPondName ? displayPondName(a.toPondName) : undefined,
      farm: displayFarmName(a.farmName),
      // Same date-only caution as `dateKey` — build the Date from the sliced
      // calendar date at local midnight, never from the raw UTC string.
      eventDate: thaiDate.medium(new Date(`${dateKey}T00:00:00`)),
      savedDateLabel: thaiDate.short(created),
      savedTimeLabel,
      backdated: !sameDay,
      by: a.createdByName,
      amount: a.amount,
      avgWeightKg: a.fishWeight,
      pricePerUnit: a.pricePerUnit,
      total: a.total,
      totalWeightKg: a.totalWeight,
      merchant: a.merchant,
    },
  };
}
