// "Today" reference shared across screens. Evaluated at module load — fine
// for typical app sessions (users open the app daily). Screens that need a
// fresh Date on each mount (e.g. flow forms, calendars) should call
// `new Date()` inside a `useState` lazy initializer rather than depending
// on this value.
export const today = new Date();

/** Format a Date as YYYY-MM-DD in local time — the wire format the backend
 *  expects for `activityDate` (parsed server-side with `time.Parse("2006-01-02", ...)`). */
export function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Format a Date as YYYY-MM in local time (CE month key for queries). */
export function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Build an RFC3339 timestamp at noon UTC from a YYYY-MM-DD calendar date.
 *  Noon avoids timezone slips flipping the calendar day when the server or
 *  client is west of UTC. */
export function toNoonUtcIso(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toISOString();
}
