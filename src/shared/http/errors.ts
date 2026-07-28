/**
 * Backend auth codes that all surface as HTTP 401, meaning the bare status is
 * not enough to decide whether the *session* is over (see `client.ts`).
 * Mirrors `backend/src/internal/errors/status.go`.
 */
export const AUTH_ERROR = {
  /** Credentials rejected for this one request: wrong password at login, wrong
   *  *current* password on change-password. Says nothing about the session. */
  invalidCredentials: '500021',
  tokenInvalid: '500022',
  tokenExpired: '500023',
} as const;

export type ApiError = {
  code: string;
  message: string;
  /** Wrapped error detail from the backend — only present for client-safe
   *  codes (validation, business rules). Useful for surfacing the actual
   *  reason instead of a generic "Validation failed". */
  details?: string;
  status: number;
};

/** Pull a user-facing message from a thrown API/unknown error. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

/** HTTP status of a thrown API error, or null when it isn't an ApiError. */
export function apiErrorStatus(err: unknown): number | null {
  if (err && typeof err === 'object' && 'status' in err) {
    const s = (err as { status?: unknown }).status;
    return typeof s === 'number' ? s : null;
  }
  return null;
}
