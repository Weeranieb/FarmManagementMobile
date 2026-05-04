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

export type FarmResponse = {
  id: number;
  clientId: number;
  name: string;
  address: string | null;
  status: 'active' | 'inactive' | string;
};

export type PondResponse = {
  id: number;
  farmId: number;
  name: string;
  status: 'active' | 'maintenance' | string;
  totalFish: number;
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
