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
