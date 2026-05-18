import { useCallback, useMemo, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import {
  dailyLogKeys,
  getDailyLogMonth,
  upsertDailyLogMonth,
  type DailyLogEntry,
  type DailyLogResponse,
} from '@/features/daily-log';
import { adaptPond, mockPonds, usePonds, type PondModel } from '@/features/pond';
import { COLS, type ColKey } from './constants';

export type CellState = 'saved' | 'dirty' | 'empty';

export type CellValues = {
  pm: number | '';
  pe: number | '';
  fresh: number | '';
  death: number | '';
  cat: number | '';
};

export type PondRow = {
  id: string;
  key: string;
  species: string;
  stock: number;
  hasPellet: boolean;
  hasFresh: boolean;
  /** Pond is in `status === 'maintenance'` — render with the locked
   *  maintenance treatment (stripe pattern, wrench pill, central lock icon). */
  maintenance: boolean;
  /** Row can't accept input. `true` for maintenance ponds AND ponds whose
   *  cycle hasn't started yet on the selected day. */
  disabled: boolean;
  state: CellState;
  v: CellValues;
};

export type ActiveCell = { pondKey: string; col: ColKey } | null;

export type UseDailyLogV6 = {
  ponds: PondRow[];
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;

  activeCell: ActiveCell;
  setActiveCell: (cell: ActiveCell) => void;

  dirtyCount: number;
  savedCount: number;
  /** Number of active ponds the user is expected to log for. Excludes
   *  maintenance ponds and pre-start ponds. */
  total: number;
  /** Number of ponds in `status === 'maintenance'`. Used by the farm chip
   *  to render the small "{n} บ่ออยู่ในซ่อมบำรุง" caption below the saved
   *  / total count. */
  maintenanceCount: number;

  setCellValue: (pondKey: string, col: ColKey, value: number | '') => void;
  /** Record the user's feed-collection pick (from the numpad picker) for a
   *  given pond + group. saveAll prefers this over what came back from the
   *  monthly GET, so cells typed against the in-numpad default still save. */
  setFeedSelection: (pondKey: string, group: 'pellet' | 'fresh', feedId: number) => void;
  /** Latest non-zero value for the active cell from any prior day (same month,
   *  then prev month) along with the date it was logged on. `null` when no
   *  prior entry exists. Drives the "เดิม X · 1 พ.ค." hint inside Numpad. */
  previousValueForActiveCell: { value: number; date: Date } | null;
  /** Feed-collection ID used in the active pond's most recent entry, scoped to
   *  the active cell's group (pellet vs fresh). Used to pre-select the Numpad's
   *  feed-type chip. `null` for groups without a feed type (death / catch) or
   *  when no prior entry exists. */
  lastUsedFeedIdForActiveCell: number | null;
  advanceActive: () => void;
  saveAll: () => Promise<SaveResult>;
  discardDirty: () => void;
  refresh: () => Promise<void>;
};

export type SaveResult = {
  ok: boolean;
  failedCount: number;
  errorCode?: string;
  errorMessage?: string;
  /** Wrapped backend detail when present — e.g. "freshFeedCollectionId is
   *  required when logging fresh feed amounts". */
  errorDetails?: string;
};

const EMPTY_VALUES: CellValues = { pm: '', pe: '', fresh: '', death: '', cat: '' };

type LocalOverride = { state: CellState; v: CellValues };
type OverrideMap = Record<string, Record<string, LocalOverride>>;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Pond `startDate` from the API is an ISO timestamp. Normalize to the same
// YYYY-MM-DD key dateKey() emits so we can compare against the selected day
// without timezone-shifted off-by-one bugs (the user's day starts when their
// local day starts, not at UTC midnight).
function startDateKey(startDate: string | null): string | null {
  if (!startDate) return null;
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return null;
  return dateKey(d);
}

// Synthetic per-pond month payload used when running unauthenticated against
// mock data. Pattern: a handful of saved days per month, varied by pondId, so
// switching dates in the day strip visibly changes savedCount.
function mockMonthForPond(pondId: number, month: string): DailyLogResponse {
  const savedDays = [3, 7, 11, 15, 19, 23, 27].filter((d) => (d + pondId) % 3 !== 0);
  return {
    pondId,
    month,
    freshFeedCollectionId: 0,
    freshFeedCollectionName: '',
    pelletFeedCollectionId: 0,
    pelletFeedCollectionName: '',
    entries: savedDays.map((day) => ({
      day,
      fresh: 17,
      pelletMorning: 5,
      pelletEvening: 5,
      deathFishCount: (day + pondId) % 4,
      touristCatchCount: 0,
    })),
  };
}

function entryToValues(e: DailyLogEntry): CellValues {
  return {
    pm: e.pelletMorning,
    pe: e.pelletEvening,
    fresh: e.fresh,
    death: e.deathFishCount,
    cat: e.touristCatchCount,
  };
}

// Map a column key to the matching numeric field on the DTO. Mirrors
// entryToValues but for single-cell lookup (used by the previous-value hint).
function entryValueForCol(e: DailyLogEntry, col: ColKey): number {
  switch (col) {
    case 'pm':
      return e.pelletMorning;
    case 'pe':
      return e.pelletEvening;
    case 'fresh':
      return e.fresh;
    case 'death':
      return e.deathFishCount;
    case 'cat':
      return e.touristCatchCount;
  }
}

// Pick the entry with the largest `day` from a list filtered to non-zero
// values for the target column. Returns null when nothing qualifies.
function latestNonZeroEntry(
  entries: readonly DailyLogEntry[] | undefined,
  col: ColKey,
  maxDayExclusive: number | null,
): DailyLogEntry | null {
  if (!entries) return null;
  let best: DailyLogEntry | null = null;
  for (const e of entries) {
    if (maxDayExclusive != null && e.day >= maxDayExclusive) continue;
    if (entryValueForCol(e, col) <= 0) continue;
    if (best == null || e.day > best.day) best = e;
  }
  return best;
}


export function useDailyLogV6(farmId: number | null | undefined): UseDailyLogV6 {
  // Call the low-level React Query hook directly. `usePondsData` would adapt
  // on every render, returning a fresh `raw.map(...)` array — that thrashes
  // downstream memos and (under React Query refetch heuristics) the network.
  // Here `rawPonds` keeps a stable reference across renders.
  const isAuth = useIsAuthenticated();
  const qc = useQueryClient();
  const { data: rawPonds, isError } = usePonds(farmId ?? undefined);

  const pondModels = useMemo<PondModel[]>(() => {
    try {
      if (!isAuth || isError || !Array.isArray(rawPonds)) {
        return farmId != null ? mockPonds.filter((p) => p.farmId === farmId) : mockPonds;
      }
      return rawPonds.map(adaptPond);
    } catch (err) {
      console.log('[DailyLog][hook] pondModels adapt threw', err);
      return [];
    }
  }, [isAuth, isError, rawPonds, farmId]);

  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [feedSelections, setFeedSelections] = useState<
    Record<string, { pellet?: number; fresh?: number }>
  >({});
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);

  const setFeedSelection = useCallback(
    (pondKey: string, group: 'pellet' | 'fresh', feedId: number) => {
      setFeedSelections((prev) => {
        const existing = prev[pondKey] ?? {};
        if (existing[group] === feedId) return prev;
        return { ...prev, [pondKey]: { ...existing, [group]: feedId } };
      });
    },
    [],
  );

  const month = useMemo(() => monthKey(selectedDate), [selectedDate]);
  const day = selectedDate.getDate();
  const dKey = useMemo(() => dateKey(selectedDate), [selectedDate]);

  // Fetch monthly daily-log data for ALL ponds — a pond currently in
  // maintenance may still have historical entries from when it was active,
  // and those should render read-only on the day they exist for. Disabled
  // when unauthenticated to avoid 401s against mock pond IDs.
  const pondIds = useMemo(() => pondModels.map((p) => p.id), [pondModels]);

  // Fan out per-pond monthly queries. Same `useQueries` pattern as the farms
  // screen (src/screens/farms/hook.ts:36). The query key is [pondId, month],
  // so swapping days inside the same month does NOT refetch — the month's
  // entries[] stays cached and the merge just picks a different `entry.day`.
  const dailyLogQueries = useQueries({
    queries: isAuth
      ? pondIds.map((id) => ({
          queryKey: dailyLogKeys.month(id, month),
          queryFn: () => getDailyLogMonth(id, month),
          enabled: isAuth,
          staleTime: 60_000,
        }))
      : [],
  });

  // Map pondId → entry for the selected day. Keyed by pondId (not by array
  // position) so a reordering or removal of a pond can never cause an entry
  // to land on the wrong row.
  const entriesByPondId = useMemo(() => {
    const m = new Map<number, DailyLogEntry>();
    pondIds.forEach((id, idx) => {
      // Authenticated: pull from per-pond month query. Unauthenticated mock
      // mode: synthesize a per-pond month so date switches visibly recalc
      // savedCount instead of being stuck at 0.
      const data: DailyLogResponse | undefined = isAuth
        ? dailyLogQueries[idx]?.data
        : mockMonthForPond(id, month);
      if (!data) return;
      const entry = data.entries.find((e) => e.day === day);
      if (entry) m.set(id, entry);
    });
    return m;
  }, [pondIds, dailyLogQueries, day, isAuth, month]);

  // Feed collection IDs per pond, read from the same monthly query that
  // populates entries. The upsert validator on the backend rejects payloads
  // whose entries carry non-zero fresh/pellet amounts without a matching
  // collection ID — even though the backend will default from the pond's
  // active record when the request omits them, that fallback only fires when
  // the active record itself has IDs set. Echoing whatever the GET returned
  // keeps the round-trip consistent and avoids surprising 500010 errors.
  const feedCollectionsByPondId = useMemo(() => {
    const m = new Map<number, { fresh?: number; pellet?: number }>();
    pondIds.forEach((id, idx) => {
      const data: DailyLogResponse | undefined = isAuth
        ? dailyLogQueries[idx]?.data
        : undefined;
      if (!data) return;
      m.set(id, {
        fresh: data.freshFeedCollectionId,
        pellet: data.pelletFeedCollectionId,
      });
    });
    return m;
  }, [pondIds, dailyLogQueries, isAuth]);

  // Previous-value hint ("เดิม X") shown inside Numpad. We need entries from
  // the active pond strictly before the selected day, falling back to the
  // previous month when the same month has nothing. Lazy-fetch the prev month
  // for the active pond only — fanning out prev-month queries for every pond
  // on screen load would double network traffic for a hint that's only used
  // once a cell is open.
  const activePondId = useMemo(
    () => (activeCell ? Number(activeCell.pondKey) : null),
    [activeCell],
  );
  const prevMonth = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return monthKey(d);
  }, [selectedDate]);

  const activePondPrevMonthQuery = useQuery({
    queryKey: dailyLogKeys.month(activePondId ?? 0, prevMonth),
    queryFn: () => getDailyLogMonth(activePondId as number, prevMonth),
    enabled: isAuth && activePondId != null,
    staleTime: 60_000,
  });

  // Resolve current/prev-month responses for the active pond. Authenticated:
  // pull from the per-pond useQueries (current) and the lazy useQuery (prev).
  // Mock mode: synthesize so cycle-isolation testing still works offline.
  const activePondCurrentMonthData = useMemo<DailyLogResponse | undefined>(() => {
    if (activePondId == null) return undefined;
    if (!isAuth) return mockMonthForPond(activePondId, month);
    const idx = pondIds.indexOf(activePondId);
    if (idx < 0) return undefined;
    return dailyLogQueries[idx]?.data;
  }, [activePondId, isAuth, month, pondIds, dailyLogQueries]);

  const activePondPrevMonthData = useMemo<DailyLogResponse | undefined>(() => {
    if (activePondId == null) return undefined;
    if (!isAuth) return mockMonthForPond(activePondId, prevMonth);
    return activePondPrevMonthQuery.data;
  }, [activePondId, isAuth, prevMonth, activePondPrevMonthQuery.data]);

  const previousValueForActiveCell = useMemo<{ value: number; date: Date } | null>(() => {
    if (!activeCell || activePondId == null) return null;
    const col = activeCell.col;
    // Same month: cap at the selected day (exclusive). Treats `0` as "no
    // data" — the backend zero-fills cells the user never touched.
    const sameMonth = latestNonZeroEntry(activePondCurrentMonthData?.entries, col, day);
    if (sameMonth) {
      return {
        value: entryValueForCol(sameMonth, col),
        date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), sameMonth.day),
      };
    }
    // Prev month: no day cap; all of its days are < the selected day.
    const prev = latestNonZeroEntry(activePondPrevMonthData?.entries, col, null);
    if (prev) {
      // Step back from a copy of selectedDate to derive prev-month's year/month
      // — month-1 wraps to Dec of the previous year automatically.
      const prevAnchor = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
      return {
        value: entryValueForCol(prev, col),
        date: new Date(prevAnchor.getFullYear(), prevAnchor.getMonth(), prev.day),
      };
    }
    return null;
  }, [activeCell, activePondId, day, selectedDate, activePondCurrentMonthData, activePondPrevMonthData]);

  const lastUsedFeedIdForActiveCell = useMemo<number | null>(() => {
    if (!activeCell || activePondId == null) return null;
    const group = COLS.find((c) => c.key === activeCell.col)?.group;
    if (group !== 'pellet' && group !== 'fresh') return null;
    // The backend tracks feed at the pond level (not per-entry), so the
    // ID on the monthly GET response *is* the feed used in the latest entry
    // — every upsert echoes the current pond-level feed back into this field.
    const pickId = (data: DailyLogResponse | undefined): number | null => {
      if (!data) return null;
      const id = group === 'pellet' ? data.pelletFeedCollectionId : data.freshFeedCollectionId;
      return typeof id === 'number' && id > 0 ? id : null;
    };
    return pickId(activePondCurrentMonthData) ?? pickId(activePondPrevMonthData);
  }, [activeCell, activePondId, activePondCurrentMonthData, activePondPrevMonthData]);

  const dayOverrides = overrides[dKey];

  const ponds = useMemo<PondRow[]>(() => {
    const rows: PondRow[] = [];
    for (const p of pondModels) {
      const key = String(p.id);
      // A pond's active cycle starts on `startDate` (the day fish were first
      // added). Days earlier than that aren't editable — the pond didn't
      // exist as an active cycle yet. We keep the row visible (so the user
      // sees the full pond list) but mark it disabled, same treatment as a
      // maintenance pond.
      const startKey = startDateKey(p.startDate);
      const notYetActive = startKey != null && startKey > dKey;
      const maintenance = p.status === 'maintenance';
      const disabled = notYetActive || p.status !== 'active';
      const backendEntry = entriesByPondId.get(p.id);
      // Maintenance ponds never accept input, so overrides are ignored —
      // a stale dirty flag can't survive a status flip. Backend entries
      // from when the pond was active still render read-only.
      const override = disabled ? undefined : dayOverrides?.[key];

      let state: CellState;
      let v: CellValues;
      if (disabled) {
        // Maintenance ponds may carry a backend entry from when they were
        // active, but they aren't part of the day's progress denominator
        // (see `total` below). Counting them as 'saved' would inflate
        // savedCount past total and confuse the user — keep the historical
        // values visible but mark the row as 'empty' for counting purposes.
        state = 'empty';
        v = backendEntry ? entryToValues(backendEntry) : EMPTY_VALUES;
      } else if (override) {
        state = override.state;
        v = override.v;
      } else if (backendEntry) {
        state = 'saved';
        v = entryToValues(backendEntry);
      } else {
        state = 'empty';
        v = EMPTY_VALUES;
      }

      rows.push({
        id: p.name,
        key,
        species: p.fishTypes[0] ?? '',
        stock: p.totalFish,
        hasPellet: !disabled,
        hasFresh: !disabled,
        maintenance,
        disabled,
        state,
        v,
      });
    }
    return rows;
  }, [pondModels, dayOverrides, entriesByPondId, dKey]);

  const setCellValue = useCallback(
    (pondKey: string, col: ColKey, value: number | '') => {
      setOverrides((prev) => {
        const bucket = prev[dKey] ?? {};
        const existing = bucket[pondKey];
        const backendEntry = entriesByPondId.get(Number(pondKey));
        // Seed first-time edits from the backend entry so the user editing
        // one cell doesn't blank the other four. Subsequent edits stack on
        // the existing override.
        let baseValues: CellValues;
        if (existing) {
          baseValues = existing.v;
        } else {
          baseValues = backendEntry ? entryToValues(backendEntry) : EMPTY_VALUES;
        }
        const nextValues: CellValues = {
          ...baseValues,
          [col]: value,
        };

        // If the user "advanced past" a pond without typing (numpad → Next
        // committing value=''), and the pond has no other data and no
        // backend entry, skip creating a ghost dirty override. Otherwise
        // saveAll would persist {0,0,0,0,0} for it and inflate savedCount.
        const allEmpty = (Object.keys(nextValues) as (keyof CellValues)[]).every(
          (k) => nextValues[k] === '',
        );
        if (allEmpty && !backendEntry) {
          if (!existing) return prev;
          // Drop the leftover override so the pond stays state='empty'.
          const { [pondKey]: _omit, ...rest } = bucket;
          return { ...prev, [dKey]: rest };
        }

        return {
          ...prev,
          [dKey]: {
            ...bucket,
            [pondKey]: { state: 'dirty', v: nextValues },
          },
        };
      });
    },
    [dKey, entriesByPondId],
  );

  const advanceActive = useCallback(() => {
    setActiveCell((cur) => {
      if (!cur) return null;
      const idx = ponds.findIndex((p) => p.key === cur.pondKey);
      if (idx < 0) return null;
      // Skip maintenance ponds — they can't accept input.
      for (let i = idx + 1; i < ponds.length; i++) {
        const next = ponds[i];
        if (next && !next.disabled) return { pondKey: next.key, col: cur.col };
      }
      return null;
    });
  }, [ponds]);

  const saveAll = useCallback(async (): Promise<SaveResult> => {
    const bucket = overrides[dKey];
    if (!bucket) return { ok: true, failedCount: 0 };
    // Defense-in-depth: even if a ghost dirty override slipped through
    // setCellValue (e.g. via legacy state), skip entries that would write
    // an all-zero record for a pond with no prior backend entry. Without
    // this filter, those rows post {0,0,0,0,0} to the backend and then
    // count as 'saved' on the next refetch.
    const dirtyEntries = Object.entries(bucket).filter(([pondKey, o]) => {
      if (o.state !== 'dirty') return false;
      const hasAnyData =
        (Object.keys(o.v) as (keyof CellValues)[]).some((k) => {
          const v = o.v[k];
          return v !== '' && Number(v) !== 0;
        });
      if (hasAnyData) return true;
      // No new data — only worth saving if we're overwriting an existing
      // backend record (e.g. user cleared cells they previously entered).
      return entriesByPondId.has(Number(pondKey));
    });
    if (dirtyEntries.length === 0) return { ok: true, failedCount: 0 };

    // Patch-upsert one entry per pond. The backend (BulkUpsert at
    // backend/src/internal/service/daily_log_service.go:272) merges entries
    // into the month, leaving other days untouched. Feed collection IDs are
    // echoed from the cached GET so the validator (`validateBulkIDs`) has
    // something to match against non-zero fresh/pellet amounts.
    const results = await Promise.allSettled(
      dirtyEntries.map(async ([pondKey, ovr]) => {
        const entry: DailyLogEntry = {
          day,
          fresh: Number(ovr.v.fresh) || 0,
          pelletMorning: Number(ovr.v.pm) || 0,
          pelletEvening: Number(ovr.v.pe) || 0,
          deathFishCount: Number(ovr.v.death) || 0,
          touristCatchCount: Number(ovr.v.cat) || 0,
        };
        const feeds = feedCollectionsByPondId.get(Number(pondKey));
        const userPick = feedSelections[pondKey];
        const payload = {
          month,
          // User's numpad pick beats the GET-derived default — the picker is
          // the source of truth at the moment of save.
          freshFeedCollectionId: userPick?.fresh ?? feeds?.fresh,
          pelletFeedCollectionId: userPick?.pellet ?? feeds?.pellet,
          entries: [entry],
        };
        try {
          await upsertDailyLogMonth(Number(pondKey), payload);
          return pondKey;
        } catch (err) {
          // Log the exact payload alongside the rejection reason — otherwise
          // a 500010 is impossible to reproduce from logs alone.
          console.log(
            '[DailyLog][saveAll] upsert failed',
            JSON.stringify({ pondId: Number(pondKey), payload, err }),
          );
          throw err;
        }
      }),
    );

    const successKeys = new Set<string>();
    let failedCount = 0;
    let errorCode: string | undefined;
    let errorMessage: string | undefined;
    let errorDetails: string | undefined;
    for (const r of results) {
      if (r.status === 'fulfilled') {
        successKeys.add(r.value);
      } else {
        failedCount += 1;
        if (errorCode == null) {
          const reason = r.reason as
            | { code?: string; message?: string; details?: string }
            | undefined;
          errorCode = typeof reason?.code === 'string' ? reason.code : undefined;
          errorMessage = typeof reason?.message === 'string' ? reason.message : undefined;
          errorDetails = typeof reason?.details === 'string' ? reason.details : undefined;
        }
      }
    }

    if (successKeys.size > 0) {
      // Flip only successful dirty entries → saved. Failed ones stay dirty so
      // the user can retry. The refetch then reconciles the cache with what
      // the backend actually accepted.
      setOverrides((prev) => {
        const cur = prev[dKey];
        if (!cur) return prev;
        const nextBucket: Record<string, LocalOverride> = {};
        for (const [k, o] of Object.entries(cur)) {
          if (successKeys.has(k) && o.state === 'dirty') {
            nextBucket[k] = { ...o, state: 'saved' };
          } else {
            nextBucket[k] = o;
          }
        }
        return { ...prev, [dKey]: nextBucket };
      });

      void qc.invalidateQueries({ queryKey: ['dailyLog'] });
    }

    return { ok: failedCount === 0, failedCount, errorCode, errorMessage, errorDetails };
  }, [overrides, dKey, month, day, qc, entriesByPondId, feedCollectionsByPondId, feedSelections]);

  const discardDirty = useCallback(() => {
    setOverrides((prev) => {
      const cur = prev[dKey];
      if (!cur) return prev;
      const nextBucket: Record<string, LocalOverride> = {};
      for (const [k, o] of Object.entries(cur)) {
        if (o.state !== 'dirty') nextBucket[k] = o;
      }
      return { ...prev, [dKey]: nextBucket };
    });
  }, [dKey]);

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ['dailyLog'] });
  }, [qc]);

  const dirtyCount = useMemo(() => ponds.filter((p) => p.state === 'dirty').length, [ponds]);
  const savedCount = useMemo(() => ponds.filter((p) => p.state === 'saved').length, [ponds]);
  // Counter denominator = ponds the user must log for today (active only).
  // Maintenance ponds appear in the table but aren't counted toward progress.
  const total = useMemo(() => ponds.filter((p) => !p.disabled).length, [ponds]);
  const maintenanceCount = useMemo(
    () => ponds.filter((p) => p.maintenance).length,
    [ponds],
  );

  return {
    ponds,
    selectedDate,
    setSelectedDate,
    activeCell,
    setActiveCell,
    dirtyCount,
    savedCount,
    total,
    maintenanceCount,
    setCellValue,
    setFeedSelection,
    previousValueForActiveCell,
    lastUsedFeedIdForActiveCell,
    advanceActive,
    saveAll,
    discardDirty,
    refresh,
  };
}
