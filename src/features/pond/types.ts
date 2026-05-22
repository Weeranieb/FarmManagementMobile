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
  /** Optional avg weight per fish in kg. */
  fishWeight?: number;
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

/** A single fish-size-grade line in a sell request. */
export type SellPondDetailItem = {
  fishSizeGradeId: number;
  weight: number;
  pricePerUnit: number;
  fishCount?: number;
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
  amount: number;
  fishType: string;
  pricePerUnit?: number;
  total: number;
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
  merchant?: string;
  toPondName?: string;
  fromPondName?: string;
};
