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
  /** Source pond's `ponds.id` — the id every /pond/:pondId route keys off, so a
   *  feed row can link straight to the pond it came from. */
  pondId: number;
  pondName: string;
  /** Farm the source pond belongs to — shown as a secondary label so a row is
   *  identifiable when pond names repeat across farms. */
  farmName: string;
  /** move only — destination pond. */
  toPondId?: number;
  toPondName?: string;
  /** Empty for a sell — species is recorded per size-grade on the detail lines,
   *  so a sale has no single species to report. */
  fishType: string;
  /** Head count. For a sell the server sums it from sell_details.fish_count. */
  amount: number;
  /** kg per fish; 0 for a sell. */
  fishWeight: number;
  fishUnit: string;
  /** ฿ per kg as entered; for a sell, the server-derived average (revenue ÷ kg). */
  pricePerUnit: number;
  /** ฿ — sell: Σ sell_details; fill/move: amount × weight × price + extras. */
  total: number;
  /** sell only — Σ sell_details.weight (kg). */
  totalWeight?: number;
  merchant?: string;
};

/**
 * One size-grade line of a sale — GET /activity/:activityId/sell-details.
 * Mirrors backend/src/internal/dto/activity_dto.go `SellDetailLine`.
 *
 * A sale is priced per grade, so this is the only source for "how many baht for
 * each size". Ordered smallest grade first. An empty array means the activity
 * is not a sell, does not exist, or is not the caller's.
 */
export type SellDetailLine = {
  fishSizeGradeId: number;
  /** Grade display name; '' when the grade row was soft-deleted. */
  sizeName: string;
  /** Absent means "not recorded" (legacy line), not zero fish. */
  fishCount?: number;
  weight: number;
  pricePerUnit: number;
  /** weight × pricePerUnit, computed server-side so the lines sum to the
   *  headline the feed reports. */
  total: number;
};
