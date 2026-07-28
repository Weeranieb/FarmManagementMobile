/**
 * The server's password rule, mirrored so a form can reject a password before
 * the request rather than after.
 *
 * Source of truth: `backend/src/internal/utils/validator.go` — `^[A-Za-z0-9]{8,}$`
 * plus at least one upper and one lower case letter. Keep the two in step; a
 * client that is merely *stricter* is fine, one that is looser hands the user a
 * raw 422 from the API.
 */
const PASSWORD_SHAPE = /^[A-Za-z0-9]{8,}$/;

export function isValidPassword(value: string): boolean {
  if (!PASSWORD_SHAPE.test(value)) return false;
  return /[A-Z]/.test(value) && /[a-z]/.test(value);
}

/** i18n key describing why `value` is rejected, or null when it is acceptable.
 *  Returns a key rather than a string so callers translate at render time. */
export function passwordErrorKey(value: string): string | null {
  if (value.length === 0) return 'auth.password.required';
  if (value.length < 8) return 'auth.password.tooShort';
  if (!PASSWORD_SHAPE.test(value)) return 'auth.password.charset';
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value)) return 'auth.password.mixedCase';
  return null;
}
