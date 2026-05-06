// Hand-typed DTOs mirroring backend/src/internal/dto. Keep in sync as the
// API evolves. Codegen is out of scope for v1.

export type UserResponse = {
  id: number;
  clientId: number | null;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string | null;
  userLevel: number;
  contactNumber: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};

export type LoginRequest = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginResponse = {
  accessToken: string;
  expiredAt: string | null;
  user: UserResponse;
};

/** Single row from GET /farm list (`FarmListResponse.farms`). */
export type FarmResponse = {
  id: number;
  clientId: number;
  name: string;
  status: string;
  pondCount: number;
  activePonds: number;
  createdAt?: string;
};

/** GET /farm response body (`data` after unwrapSuccessBody). */
export type FarmListResponse = {
  farms: FarmResponse[];
  total?: number;
  totalActive?: number;
};

export type FarmDetailSummary = {
  totalStock: number;
  activePonds: number;
  totalPonds: number;
  maintenancePonds: number;
};

export type FarmDetailPondItem = {
  id: number;
  name: string;
  status: string;
};

/** GET /farm/:id payload. */
export type FarmDetailResponse = {
  id: number;
  clientId: number;
  name: string;
  status: string;
  createdAt?: string;
  summary: FarmDetailSummary;
  ponds: FarmDetailPondItem[];
};

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

export type DailyLogEntry = {
  day: number;
  freshMorning: number;
  freshEvening: number;
  pelletMorning: number;
  pelletEvening: number;
  deathFishCount: number;
  touristCatchCount: number;
};

export type DailyLogResponse = {
  pondId: number;
  month: string;
  freshFeedCollectionId: number;
  freshFeedCollectionName: string;
  pelletFeedCollectionId: number;
  pelletFeedCollectionName: string;
  entries: DailyLogEntry[];
};

export type ApiError = {
  code: string;
  message: string;
  status: number;
};
