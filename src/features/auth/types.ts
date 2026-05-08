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
