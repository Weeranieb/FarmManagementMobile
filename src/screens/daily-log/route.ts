// Deep-link contract for the Daily Log screen. Shared by every entry point
// (home pending-pond chips, pond-detail drill-down) so the target shape and the
// route-param serialization live in one place.

/** Where to open the Daily Log. Both fields are optional: the FAB / CTA opens it
 *  with neither (defaults to the first farm), a pending-pond chip passes both,
 *  and a pond-detail drill-down passes both. Omitting `farmId` makes the screen
 *  fall back to the first farm — so callers that know the pond's farm must pass
 *  it, or a pond from a non-default farm won't be found. */
export type DailyLogTarget = { farmId?: number; pondId?: number };

/** Serialize a target into expo-router query params, omitting absent fields so
 *  they never reach the route as the string "undefined". */
export function dailyLogRouteParams(target: DailyLogTarget = {}): Record<string, string> {
  const params: Record<string, string> = {};
  if (target.pondId != null) params.pondId = String(target.pondId);
  if (target.farmId != null) params.farmId = String(target.farmId);
  return params;
}
