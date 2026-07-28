import { passwordErrorKey } from '@/features/auth';

export const WORKER_LIMITS = {
  username: 32,
  name: 60,
  email: 120,
  contact: 10,
} as const;

export type WorkerFormValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  /** Blank in edit mode — passwords are changed through the reset sheet. */
  password: string;
};

export type WorkerFormErrors = Partial<Record<keyof WorkerFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The backend's username column is unique and used as the login identifier, so
 *  keep it to characters that survive being typed on a phone keyboard. */
const USERNAME_RE = /^[a-z0-9._-]+$/;

/**
 * Mirrors the server's rules so a save is not bounced back as a raw 422.
 * Values are i18n keys, translated at render time.
 *
 * `requirePassword` is false in edit mode: PUT /user/:id carries no password.
 */
export function validateWorkerForm(
  v: WorkerFormValues,
  requirePassword: boolean,
): WorkerFormErrors {
  const e: WorkerFormErrors = {};

  const username = v.username.trim();
  if (username.length === 0) e.username = 'workers.err.usernameRequired';
  else if (!USERNAME_RE.test(username)) e.username = 'workers.err.usernameCharset';

  if (v.firstName.trim().length === 0) e.firstName = 'workers.err.firstNameRequired';

  const email = v.email.trim();
  if (email.length > 0 && !EMAIL_RE.test(email)) e.email = 'workers.err.email';

  // The server stores contactNumber as a plain string, but every other form in
  // the app treats a Thai mobile number as exactly 10 digits — stay consistent.
  const digits = v.contactNumber.replace(/\D/g, '');
  if (digits.length === 0) e.contactNumber = 'workers.err.contactRequired';
  else if (digits.length !== 10) e.contactNumber = 'workers.err.contactDigits';

  if (requirePassword) {
    const key = passwordErrorKey(v.password);
    if (key) e.password = key;
  }

  return e;
}

export function hasWorkerFormErrors(e: WorkerFormErrors): boolean {
  return Object.keys(e).length > 0;
}
