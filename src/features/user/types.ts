// DTOs mirroring backend/src/internal/dto/user_dto.go. Keep in sync.
//
// `UserResponse` itself lives in `@/features/auth` — it is the shape the signed-in
// user is stored as, and the staff list returns the same rows.

/** POST /user. A client admin's new account always lands in the caller's own
 *  client: the server takes it from the token and ignores any `clientId` here,
 *  which is why this request type doesn't expose one. */
export type CreateWorkerRequest = {
  username: string;
  password: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  contactNumber: string;
  /** 1 = worker, 2 = co-owner. The server refuses 3 outright. */
  userLevel: number;
};

/** PUT /user/:id. Omits clientId and password — moving a user between clients is
 *  super-admin work, and passwords go through the reset endpoint. */
export type UpdateWorkerRequest = {
  username: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  contactNumber: string;
  userLevel?: number;
};

/** PUT /user/:id/password — an admin reset, so no current password is required. */
export type ResetWorkerPasswordRequest = { password: string };
