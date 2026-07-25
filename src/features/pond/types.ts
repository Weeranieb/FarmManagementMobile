// DTOs mirroring backend/src/internal/dto/pond. Keep in sync as the API evolves.

export type PondResponse = {
  id: number;
  farmId: number;
  name: string;
  status: 'active' | 'maintenance' | string;
  totalFish?: number | null;
  fishTypes: string[];
  ageDays: number | null;
  startDate: string | null;
  latestActivityDate?: string | null;
  latestActivityType?: 'fill' | 'move' | 'sell' | string | null;
  loggedToday?: boolean;
  lateDays?: number;
  /** Live cycle-to-date P&L for the active cycle (null if no active cycle).
   *  Same values `applyCloseFeedSnapshot` (Go) will freeze if this pond closes
   *  right now — see feed_cost_calculator.go. */
  totalCost?: number | null;
  totalRevenue?: number | null;
  feedCost?: number | null;
  netResult?: number | null;
};

/** One row of additional costs. Mirrors `dto.AdditionalCostItem` (Go). */
export type AdditionalCostItem = {
  title: string;
  cost: number;
};

/** Body for POST /pond/:pondId/fill. Mirrors `dto.PondFillRequest`. */
export type FillPondRequest = {
  fishType: string;
  amount: number;
  /** Required avg weight per fish in kg (decimal_gt0 server-side) — fill cost
   *  is amount × fishWeight × pricePerUnit, so a missing weight would book a
   *  zero stock cost. */
  fishWeight: number;
  /** Required price per kg (decimal_gt0 server-side). */
  pricePerUnit: number;
  additionalCosts?: AdditionalCostItem[];
  /** YYYY-MM-DD (local). Backend parses with `time.Parse("2006-01-02", …)`. */
  activityDate: string;
  remark?: string;
};

/** Body for POST /pond/:pondId/move. Mirrors `dto.PondMoveRequest`. */
export type MovePondRequest = {
  toPondId: number;
  fishType: string;
  amount: number;
  /** Required: backend rejects fishWeight <= 0 (see `decimal_gt0` validator). */
  fishWeight: number;
  pricePerUnit: number;
  additionalCosts?: AdditionalCostItem[];
  activityDate: string;
  remark?: string;
  markToClose?: boolean;
};

/** A single fish-size-grade line in a sell request. Backend decrements the
 *  pond's head count by fishCount, so it's required (`validate:"required,min=1"`
 *  server-side — see `dto.PondSellDetailItem`, Go). */
export type SellPondDetailItem = {
  fishSizeGradeId: number;
  weight: number;
  pricePerUnit: number;
  fishCount: number;
};

/** Body for POST /pond/:pondId/sell. Mirrors `dto.PondSellRequest`. */
export type SellPondRequest = {
  activityDate: string;
  details: SellPondDetailItem[];
  merchantId?: number;
  markToClose?: boolean;
  additionalCosts?: AdditionalCostItem[];
};

/** UI model for pond activity timeline rows (from API via `adaptActivity`). */
export type PondActivityModel = {
  id: number;
  mode: 'fill' | 'move' | 'sell';
  /** Whether the row is from the perspective of the destination ('in') or source ('out'). */
  direction: 'in' | 'out';
  date: string;
  /** Head count. For a sell this is the summed sell_details.fish_count. */
  amount: number;
  fishType: string;
  /** ฿/kg — the average (total ÷ weight) for a sell, the recorded price otherwise. */
  pricePerUnit?: number;
  /** Gross value. A sell's additional costs are NOT deducted (see `additionalCost`). */
  total: number;
  /** Sells only: summed weight of the sale in kg. */
  totalWeightKg?: number;
  /** Extra costs booked on the activity. Already inside `total` for fill/move. */
  additionalCost?: number;
  remark?: string;
  merchant?: string;
  /** Set for outgoing moves — where the fish went. */
  toPondName?: string;
  /** Set for incoming moves — where the fish came from. */
  fromPondName?: string;
};

/** Sell-flow picker option — wire to API when merchant list endpoint exists. */
export type MerchantOption = {
  id: number;
  name: string;
  contactNumber: string;
  location: string;
};

/** Sell-flow picker option — wire to API when size-grade list endpoint exists. */
export type SizeGradeOption = {
  id: number;
  name: string;
};

/**
 * One production cycle (active or closed) with its P&L, returned by
 * GET /pond/:pondId/cycles. Mirrors `dto.PondCycleResponse` (Go).
 *
 * `feedCost` is null for legacy cycles closed before feed-cost accounting
 * existed; for those the `netResult` does NOT yet subtract feed. For the active
 * cycle feed cost is derived live and `netResult = totalRevenue − totalCost −
 * feedCost`; for a closed cycle both are the values frozen at close. Never
 * recompute these client-side — display as received.
 */
export type PondCycleResponse = {
  id: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  totalFish: number;
  fishTypes: string[];
  totalCost: number;
  totalRevenue: number;
  feedCost: number | null;
  netResult: number;
};

/** One row of the pond activity timeline returned by GET /pond/:pondId/activities. */
export type ActivityResponse = {
  id: number;
  mode: 'fill' | 'move' | 'sell';
  direction: 'in' | 'out';
  activityDate: string;
  fishType: string;
  amount: number;
  pricePerUnit: number;
  total: number;
  /** Sells only — summed sell_details.weight (kg). */
  totalWeight?: number;
  /** Summed additional_costs; omitted when zero. Part of `total` for fill/move. */
  additionalCost?: number;
  merchant?: string;
  toPondName?: string;
  fromPondName?: string;
};
