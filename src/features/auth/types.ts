// DTOs mirroring backend/src/internal/dto/auth. Keep in sync as the API evolves.

export type UserResponse = {
  id: number;
  clientId: number | null;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string | null;
  userLevel: number;
  contactNumber: string;
  /** When the current password was set. Null for accounts whose password
   *  predates the backend's tracking column — render that as unknown, never as
   *  a date. Not the same as `updatedAt`, which moves on any profile edit. */
  passwordUpdatedAt: string | null;
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
