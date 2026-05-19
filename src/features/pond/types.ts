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

export type FillPondRequest = {
  fishType: string;
  amount: number;
  pricePerUnit?: number;
  remark?: string;
};

export type MovePondRequest = {
  toPondId: number;
  amount: number;
  remark?: string;
};

export type SellPondRequest = {
  amount: number;
  pricePerKg: number;
  merchantId: number;
  sizeGradeId: number;
};

/** UI model for pond activity timeline rows (from API via `adaptActivity`). */
export type PondActivityModel = {
  id: number;
  mode: 'fill' | 'move' | 'sell';
  date: string;
  amount: number;
  fishType: string;
  pricePerUnit?: number;
  total: number;
  remark?: string;
  merchant?: string;
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
  activityDate: string;
  fishType: string;
  amount: number;
  pricePerUnit: number;
  total: number;
  merchant?: string;
  toPondName?: string;
};
