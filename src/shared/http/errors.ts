export type ApiError = {
  code: string;
  message: string;
  /** Wrapped error detail from the backend — only present for client-safe
   *  codes (validation, business rules). Useful for surfacing the actual
   *  reason instead of a generic "Validation failed". */
  details?: string;
  status: number;
};
