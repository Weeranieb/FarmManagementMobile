// DTOs mirroring backend/src/internal/dto/activity_dto.go. Keep in sync.

/**
 * One row of the farm-wide activity feed returned by GET /activity.
 * Discrete user-authored events only (fill / move / sell — buy reserved for
 * a future phase). Daily-log saves never appear here by design.
 */
export type ActivityFeedItem = {
  id: number;
  mode: 'fill' | 'move' | 'sell' | 'buy';
  /** User-chosen event date. Date-only — the time part is always midnight UTC,
   *  so read the calendar date from the string, never via local Date math. */
  activityDate: string;
  /** When the record was saved (real timestamp). */
  createdAt: string;
  /** Author's username (audit identity) — compare against the signed-in user
   *  to render "โดยคุณ". */
  createdBy: string;
  /** Author's display name; the server falls back to the username when the
   *  user record no longer exists. */
  createdByName: string;
  pondName: string;
  /** move only — destination pond. */
  toPondName?: string;
  fishType: string;
  amount: number;
  fishWeight: number;
  fishUnit: string;
  pricePerUnit: number;
  /** ฿ — sell: Σ sell_details; fill/move: amount × weight × price + extras. */
  total: number;
  /** sell only — Σ sell_details.weight (kg). */
  totalWeight?: number;
  merchant?: string;
};
