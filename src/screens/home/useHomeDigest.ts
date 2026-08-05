import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { useFarmsData } from '@/features/farm';
import { adaptPond, listPonds, pondKeys, type PondModel } from '@/features/pond';
import {
  dailyLogKeys,
  getDailyLogMonth,
  type DailyLogEntry,
  type DailyLogResponse,
} from '@/features/daily-log';
import { today, toMonthKey } from '@/shared/time';
import type { HomeDigest, PendingPond } from './constants';

// Per-pond month queries are cheap to keep warm and rarely change within a
// session — match the staleTime the Farms / Daily Log screens use so the three
// screens share one set of cached queries instead of refetching on every hop.
const STALE = 60_000;

/**
 * Consecutive unlogged days immediately before `day`, read off the month's set
 * of logged days. 0 means only today is missing (yesterday was logged). Bounded
 * to the current month: a gap that runs back into last month reads as the
 * days-so-far, never more — it under-reports rather than inventing lateness.
 */
function lateDaysFor(entries: readonly DailyLogEntry[], day: number): number {
  const logged = new Set(entries.map((e) => e.day));
  let late = 0;
  for (let d = day - 1; d >= 1; d--) {
    if (logged.has(d)) break;
    late++;
  }
  return late;
}

/**
 * Feed cost for one day's entry = Σ (feed quantity × that feed's unit price),
 * each feed in its own pack unit — fresh in ลัง, pellet in ถุง — against the
 * matching per-pack price the backend resolved. `priced` is false when the entry
 * recorded a feed quantity we have no unit price for — the caller then reports
 * the day's cost as unknown ("—") rather than a silently-understated ฿ figure.
 */
function dayFeedCost(e: DailyLogEntry): { cost: number; priced: boolean } {
  const freshCrates = Number(e.fresh) || 0;
  const pelletBags = (Number(e.pelletMorning) || 0) + (Number(e.pelletEvening) || 0);
  const freshPrice = e.freshUnitPrice != null ? Number(e.freshUnitPrice) : NaN;
  const pelletPrice = e.pelletUnitPrice != null ? Number(e.pelletUnitPrice) : NaN;

  let cost = 0;
  let priced = true;
  if (freshCrates > 0) {
    if (Number.isFinite(freshPrice)) cost += freshCrates * freshPrice;
    else priced = false;
  }
  if (pelletBags > 0) {
    if (Number.isFinite(pelletPrice)) cost += pelletBags * pelletPrice;
    else priced = false;
  }
  return { cost, priced };
}

export type HomeDigestState = {
  digest: HomeDigest | null;
  /** Ponds and today's logs are still resolving — render the card skeleton. */
  isLoading: boolean;
  /** Client has no farms yet — render the onboarding hero, not a 0/0 card. */
  isEmpty: boolean;
  isError: boolean;
};

/**
 * Live Home digest, assembled from endpoints Phase 1 actually exposes:
 *   GET /farm                         → farms (+ active-pond counts)
 *   GET /pond?farmId= (per farm)      → pond identities, status, stock
 *   GET /pond/:id/daily-logs?month=   → today's entry per active pond
 * `loggedToday` / `lateDays` are NOT served by /pond, so they're derived from
 * each active pond's monthly daily-log. Feed cost / deaths come from today's
 * entry. Numbers are honest: anything we can't compute reports as null → "—".
 */
export function useHomeDigest(): HomeDigestState {
  const enabled = useIsAuthenticated();
  const farms = useFarmsData();
  const farmList = farms.data;

  // /pond doesn't echo the farm name (adaptPond leaves it ''), but the pending
  // list groups ponds by farm — so resolve farmId → name from the farm list.
  const farmNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const f of farmList) m.set(f.id, f.name);
    return m;
  }, [farmList]);

  // (1) Per-farm pond lists. /pond requires a farmId, so fan out one query per
  //     farm — same pondKeys.byFarm cache the Farms screen populates.
  const pondQueries = useQueries({
    queries: enabled
      ? farmList.map((f) => ({
          queryKey: pondKeys.byFarm(f.id),
          queryFn: () => listPonds(f.id),
          enabled,
          staleTime: STALE,
        }))
      : [],
  });

  const pondsSettled = pondQueries.every((q) => !q.isLoading);
  const activePonds = useMemo<PondModel[]>(() => {
    const out: PondModel[] = [];
    for (const q of pondQueries) {
      const raw = q.data;
      if (!Array.isArray(raw)) continue;
      for (const p of raw) {
        const model = adaptPond(p);
        if (model.status === 'active') out.push(model);
      }
    }
    return out;
  }, [pondQueries]);

  // (2) Per-active-pond monthly daily-log. Keyed exactly like the Daily Log
  //     screen (dailyLogKeys.month) so the cache is shared, not duplicated.
  const month = toMonthKey(today);
  const day = today.getDate();
  const activePondIds = useMemo(() => activePonds.map((p) => p.id), [activePonds]);
  const logQueries = useQueries({
    queries: enabled
      ? activePondIds.map((id) => ({
          queryKey: dailyLogKeys.month(id, month),
          queryFn: () => getDailyLogMonth(id, month),
          enabled,
          staleTime: STALE,
        }))
      : [],
  });
  const logsSettled = logQueries.every((q) => !q.isLoading);

  // Map pondId → month data, keyed by id (not array index) so a reorder/removal
  // of a pond can never land one pond's log on another pond's row.
  const logByPondId = useMemo(() => {
    const m = new Map<number, DailyLogResponse>();
    activePondIds.forEach((id, idx) => {
      const data = logQueries[idx]?.data;
      if (data) m.set(id, data);
    });
    return m;
  }, [activePondIds, logQueries]);

  const isLoading =
    enabled && (farms.isLoading || !pondsSettled || (activePonds.length > 0 && !logsSettled));

  const digest = useMemo<HomeDigest | null>(() => {
    if (!enabled || isLoading) return null;

    const pending: PendingPond[] = [];
    let loggedCount = 0;
    let totalFish = 0;
    let deaths = 0;
    let feedCost = 0;
    let feedPriced = true;

    for (const p of activePonds) {
      totalFish += p.totalFish;
      const entries = logByPondId.get(p.id)?.entries ?? [];
      const todayEntry = entries.find((e) => e.day === day);
      if (todayEntry) {
        loggedCount++;
        deaths += todayEntry.deathFishCount ?? 0;
        const { cost, priced } = dayFeedCost(todayEntry);
        feedCost += cost;
        if (!priced) feedPriced = false;
      } else {
        pending.push({
          id: p.id,
          name: p.name,
          farmId: p.farmId,
          farmName: farmNameById.get(p.farmId) ?? '',
          lateDays: lateDaysFor(entries, day),
        });
      }
    }

    const haveToday = loggedCount > 0;
    return {
      activeCount: activePonds.length,
      loggedCount,
      pending,
      late: pending.filter((p) => p.lateDays > 0),
      totalFish,
      // Show "—" (null) rather than an understated number when any logged feed
      // lacks a unit price; show ฿0 only when ponds were logged with no feed.
      feedCostToday: haveToday && feedPriced ? Math.round(feedCost) : null,
      deathsToday: haveToday ? deaths : null,
    };
  }, [enabled, isLoading, activePonds, logByPondId, day, farmNameById]);

  // Onboarding hero only when the client genuinely has no farm — not when ponds
  // happened to fail to load (that degrades to a 0/0 card instead).
  const isEmpty = enabled && !farms.isLoading && farmList.length === 0;

  return {
    digest,
    isLoading: Boolean(isLoading),
    isEmpty: Boolean(isEmpty),
    isError: farms.isError,
  };
}
