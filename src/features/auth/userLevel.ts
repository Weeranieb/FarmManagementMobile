// Mirrors frontend/src/constants/userLevel.ts — keep in sync.
// 1 = normal (own pond), 2 = client admin (their business),
// 3 = super admin (master data, all clients).

import type { UserResponse } from './types';

export const UserLevel = {
  Normal: 1,
  ClientAdmin: 2,
  SuperAdmin: 3,
} as const;

export type UserLevelValue = (typeof UserLevel)[keyof typeof UserLevel];

export function isClientAdmin(user: UserResponse | null | undefined): boolean {
  return user != null && user.userLevel >= UserLevel.ClientAdmin;
}
