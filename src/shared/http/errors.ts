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
