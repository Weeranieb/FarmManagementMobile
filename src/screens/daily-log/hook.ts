import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import {
  dailyLogKeys,
  getDailyLogMonth,
  upsertDailyLogMonth,
  type DailyLogEntry,
  type DailyLogResponse,
} from '@/features/daily-log';
import { adaptPond, usePonds, type PondModel } from '@/features/pond';
import { toIsoDate, toMonthKey } from '@/shared/time';
import { COLS, isCellValueInvalid, type ColKey } from './constants';

export type CellState = 'saved' | 'dirty' | 'empty';

export type CellValues = {
  pm: number | '';
  pe: number | '';
  fresh: number | '';
  death: number | '';
  cat: number | '';
};

const EMPTY_DIRTY_COLS: ReadonlySet<ColKey> = new Set();

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
  /** Per-cell dirty set — which columns hold unsaved local edits. Empty
   *  for clean rows (state !== 'dirty'). TableRow marks these cells with
   *  the amber "changed" dot in the top-right corner (Daily Log v7 frame
   *  Z + legend). */
  dirtyCols: ReadonlySet<ColKey>;
};

export type ActiveCell = { pondKey: string; col: ColKey } | null;

export type UseDailyLogV6 = {
  ponds: PondRow[];
  /** No pond list to render yet — the farm is resolving or the scoped pond
   *  query is fetching cold. The view shows a table skeleton instead of an
   *  empty grid. */
  loading: boolean;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;

  activeCell: ActiveCell;
  setActiveCell: (cell: ActiveCell) => void;

  dirtyCount: number;
  savedCount: number;
  /** Number of active ponds with at least one out-of-range cell value
   *  (`isCellValueInvalid`). Drives the SaveBar disable + the inline
   *  guard text — saving is blocked while any row is invalid so the
   *  bulk upsert doesn't ship known-bad data. */
  invalidCount: number;
  /** Number of active ponds the user is expected to log for. Excludes
   *  maintenance ponds and pre-start ponds. */
  total: number;
  /** Number of ponds in `status === 'maintenance'`. Used by the farm chip
   *  to render the small "{n} บ่ออยู่ในซ่อมบำรุง" caption below the saved
   *  / total count. */
  maintenanceCount: number;
  /** Set of `${year}-${monthIdx}` (0-based month) for months that contain
   *  any dirty (unsaved) override across all dates. Drives the "มีค้าง"
   *  amber-dot indicator inside the month/year picker so users can spot
   *
   *  pending edits from a different month at a glance. */
  unsavedMonths: ReadonlySet<string>;
  /** Set of `YYYY-MM-DD` keys for days with any unsaved override. Drives
   *  the amber dot on day pills in the date strip so users can find their
   *  way back to a day with pending edits. */
  daysWithDrafts: ReadonlySet<string>;
  /** # of (pond, day) drafts in the CURRENT month — drives the SaveBar
   *  enable/badge and the "รายการ" count. Save-all commits the whole month. */
  monthEditsCount: number;
  /** # of distinct days in the current month that carry any draft. */
  monthDaysCount: number;
  /** # of distinct ponds edited across the current month. */
  monthPondCount: number;
  /** # of (pond, day) drafts in the current month holding an out-of-range
   *  value. Blocks save month-wide (SaveBar + navigation guard) so a bad
   *  value on a non-visible day can't ship. */
  monthInvalidCount: number;
  /** By-feed-type roll-up of the current month's drafts for the confirm sheet. */
  monthSummary: MonthSummary;

  setCellValue: (pondKey: string, col: ColKey, value: number | '') => void;
  /** Record the user's feed-collection pick (from the numpad picker) for a
   *  given pond + group. saveAll prefers this over what came back from the
   *  monthly GET, so cells typed against the in-numpad default still save. */
  setFeedSelection: (pondKey: string, group: 'pellet' | 'fresh', feedId: number) => void;
  /** Feed-collection ID used in the active pond's most recent entry, scoped to
   *  the active cell's group (pellet vs fresh). Used to pre-select the Numpad's
   *  feed-type chip. `null` for groups without a feed type (death / catch) or
   *  when no prior entry exists. */
  lastUsedFeedIdForActiveCell: number | null;
  advanceActive: () => void;
  /** No further cell to advance to — the numpad shows "เสร็จสิ้น" (finish)
   *  rather than "ถัดไป" and closes on press. */
  activeCellIsLast: boolean;
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

/** By-feed-type roll-up of the current month's drafts, shown in the confirm
 *  sheet before a month-wide save. `days` on each feed = how many distinct
 *  days that feed type was logged on (for the "(X วัน)" caption). */
export type MonthSummary = {
  month: string; // "YYYY-MM"
  daysEdited: number;
  pondCount: number;
  pellet: { total: number; days: number };
  fresh: { total: number; days: number };
  death: { total: number; days: number };
};

const EMPTY_VALUES: CellValues = { pm: '', pe: '', fresh: '', death: '', cat: '' };

// Overrides only exist for ponds with at least one dirty cell. On successful
// save, the upsert response is written into the React Query cache and the
// override is dropped — saved values render from the cache, not from here.
type LocalOverride = { v: CellValues; dirtyCols: ReadonlySet<ColKey> };
type OverrideMap = Record<string, Record<string, LocalOverride>>;

const CELL_KEYS: readonly (keyof CellValues)[] = ['pm', 'pe', 'fresh', 'death', 'cat'];

// All columns, in table order — "ถัดไป" auto-advances through every one
// (เช้า → เย็น → เหยื่อสด → ปลาตาย → ตกปลา) so the whole grid can be filled
// from the keypad without tapping each death / catch cell by hand.
const SNAKE_COLS: readonly ColKey[] = COLS.map((c) => c.key);

// Column-major snake across all columns: the next fillable pond down the
// current column, then the first fillable pond at the top of the next column.
// Returns null only at the very end (bottom of the last column) — which the
// caller treats as "finish, close the numpad".
function nextSnakeCell(cur: NonNullable<ActiveCell>, ponds: PondRow[]): ActiveCell {
  const colIdx = SNAKE_COLS.indexOf(cur.col);
  if (colIdx < 0) return null;
  const pondIdx = ponds.findIndex((p) => p.key === cur.pondKey);
  if (pondIdx < 0) return null;
  // Down the current column to the next fillable pond.
  for (let i = pondIdx + 1; i < ponds.length; i++) {
    const p = ponds[i];
    if (p && !p.disabled) return { pondKey: p.key, col: cur.col };
  }
  // End of column — wrap to the first fillable pond of the next column.
  const nextCol = SNAKE_COLS[colIdx + 1];
  if (nextCol == null) return null;
  for (let i = 0; i < ponds.length; i++) {
    const p = ponds[i];
    if (p && !p.disabled) return { pondKey: p.key, col: nextCol };
  }
  return null;
}

// Numeric comparison helper: treats '' as 0 because the backend zero-fills
// untouched cells. Cleared-back-to-empty matches an absent backend value.
function valuesEqual(a: number | '', b: number | ''): boolean {
  const na = a === '' ? 0 : Number(a);
  const nb = b === '' ? 0 : Number(b);
  return na === nb;
}

function computeDirtyCols(next: CellValues, ref: CellValues): ReadonlySet<ColKey> {
  const out = new Set<ColKey>();
  for (const k of CELL_KEYS) {
    if (!valuesEqual(next[k], ref[k])) out.add(k as ColKey);
  }
  return out;
}

function startDateKey(startDate: string | null): string | null {
  if (!startDate) return null;
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return null;
  return toIsoDate(d);
}

// Slice a dKey ("YYYY-MM-DD") back into its month key ("YYYY-MM") and 1-based
// day number — used to group/filter overrides by month for the month-wide save.
const dKeyMonth = (dk: string): string => dk.slice(0, 7);
const dKeyDay = (dk: string): number => Number(dk.slice(8, 10));

function entryToValues(e: DailyLogEntry): CellValues {
  return {
    pm: e.pelletMorning,
    pe: e.pelletEvening,
    fresh: e.fresh,
    death: e.deathFishCount,
    cat: e.touristCatchCount ?? '',
  };
}

type UseDailyLogV6Options = {
  /** Focus this pond when rows load (pond detail → daily log drill-down). */
  initialPondId?: number;
  /** Farms are still loading upstream, so a null `farmId` means "resolving"
   *  (show the skeleton) rather than "this client has no farms" (show the
   *  empty table). Without this the skeleton would hang forever for a
   *  farmless account. */
  farmsLoading?: boolean;
};

export function useDailyLogV6(
  farmId: number | null | undefined,
  options?: UseDailyLogV6Options,
): UseDailyLogV6 {
  const initialPondId = options?.initialPondId;
  const farmsLoading = options?.farmsLoading ?? false;
  const initialFocusDone = useRef(false);
  // Call the low-level React Query hook directly. `usePondsData` would adapt
  // on every render, returning a fresh `raw.map(...)` array — that thrashes
  // downstream memos and (under React Query refetch heuristics) the network.
  // Here `rawPonds` keeps a stable reference across renders.
  const isAuth = useIsAuthenticated();
  const qc = useQueryClient();
  // Gate the pond fetch on a resolved farm. Until the screen knows which farm
  // to show (opened from Home with no farmId → resolving `farms[0]`), firing
  // `usePonds(undefined)` would hit the unscoped `['ponds']` key + a farmless
  // `GET /pond` the backend rejects — surfacing as a blank table that only
  // fills once the scoped, Home-warmed query takes over. Disabled here, the
  // table renders a skeleton instead (see `loading`).
  const pondsQuery = usePonds(farmId ?? undefined, { enabled: farmId != null });
  const rawPonds = pondsQuery.data;
  const isError = pondsQuery.isError;

  const pondModels = useMemo<PondModel[]>(() => {
    try {
      if (!isAuth || isError || !Array.isArray(rawPonds)) {
        return [];
      }
      return rawPonds.map(adaptPond);
    } catch (err) {
      console.log('[DailyLog][hook] pondModels adapt threw', err);
      return [];
    }
  }, [isAuth, isError, rawPonds]);

  // Skeleton gate: true while there's no pond list to render yet — either the
  // farm is still resolving (null `farmId` *while farms load*) or the scoped
  // pond query is fetching cold (nothing warm from Home/Farms). A farm that
  // genuinely has zero ponds — or a client with no farms at all — settles to
  // `false` so the empty table shows instead of a perpetual skeleton.
  const loading =
    (farmId == null && farmsLoading) || (pondsQuery.isLoading && pondModels.length === 0);

  const [overrides, setOverrides] = useState<OverrideMap>({});
  // saveAll reads the latest overrides through this ref rather than the value
  // captured in its useCallback closure. A stale closure (e.g. the confirm
  // sheet or a queued callback holding an older saveAll) must never build the
  // payload from an out-of-date draft set — that yields an empty payload, a
  // "saved" toast, and day dots that never clear.
  const overridesRef = useRef<OverrideMap>(overrides);
  overridesRef.current = overrides;
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

  const month = useMemo(() => toMonthKey(selectedDate), [selectedDate]);
  const day = selectedDate.getDate();
  const dKey = useMemo(() => toIsoDate(selectedDate), [selectedDate]);

  // Fetch monthly daily-log data for ALL ponds — a pond currently in
  // maintenance may still have historical entries from when it was active,
  // and those should render read-only on the day they exist for. Disabled
  // when unauthenticated to avoid 401s.
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
      const data: DailyLogResponse | undefined = isAuth ? dailyLogQueries[idx]?.data : undefined;
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
      const data: DailyLogResponse | undefined = isAuth ? dailyLogQueries[idx]?.data : undefined;
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
    return toMonthKey(d);
  }, [selectedDate]);

  const activePondPrevMonthQuery = useQuery({
    queryKey: dailyLogKeys.month(activePondId ?? 0, prevMonth),
    queryFn: () => getDailyLogMonth(activePondId as number, prevMonth),
    enabled: isAuth && activePondId != null,
    staleTime: 60_000,
  });

  const activePondCurrentMonthData = useMemo<DailyLogResponse | undefined>(() => {
    if (activePondId == null || !isAuth) return undefined;
    const idx = pondIds.indexOf(activePondId);
    if (idx < 0) return undefined;
    return dailyLogQueries[idx]?.data;
  }, [activePondId, isAuth, pondIds, dailyLogQueries]);

  const activePondPrevMonthData = useMemo<DailyLogResponse | undefined>(() => {
    if (activePondId == null || !isAuth) return undefined;
    return activePondPrevMonthQuery.data;
  }, [activePondId, isAuth, activePondPrevMonthQuery.data]);

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
      let dirtyCols: ReadonlySet<ColKey> = EMPTY_DIRTY_COLS;
      if (disabled) {
        // Maintenance ponds may carry a backend entry from when they were
        // active, but they aren't part of the day's progress denominator
        // (see `total` below). Counting them as 'saved' would inflate
        // savedCount past total and confuse the user — keep the historical
        // values visible but mark the row as 'empty' for counting purposes.
        state = 'empty';
        v = backendEntry ? entryToValues(backendEntry) : EMPTY_VALUES;
      } else if (override) {
        state = 'dirty';
        v = override.v;
        dirtyCols = override.dirtyCols;
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
        dirtyCols,
      });
    }
    rows.sort((a, b) => Number(a.disabled) - Number(b.disabled));
    return rows;
  }, [pondModels, dayOverrides, entriesByPondId, dKey]);

  useEffect(() => {
    if (initialFocusDone.current || initialPondId == null || !Number.isFinite(initialPondId)) {
      return;
    }
    const key = String(initialPondId);
    const row = ponds.find((p) => p.key === key);
    if (!row) return;
    initialFocusDone.current = true;
    if (!row.disabled) {
      setActiveCell({ pondKey: key, col: 'pm' });
    }
  }, [initialPondId, ponds]);

  const setCellValue = useCallback(
    (pondKey: string, col: ColKey, value: number | '') => {
      setOverrides((prev) => {
        const bucket = prev[dKey] ?? {};
        const existing = bucket[pondKey];
        const backendEntry = entriesByPondId.get(Number(pondKey));
        // Seed first-time edits from the backend entry so the user editing
        // one cell doesn't blank the other four. Subsequent edits stack on
        // the existing override.
        const baseValues: CellValues = existing
          ? existing.v
          : backendEntry
            ? entryToValues(backendEntry)
            : EMPTY_VALUES;
        const nextValues: CellValues = { ...baseValues, [col]: value };

        // Dirty = differs from the backend reference. Reverting a cell to
        // its original server value clears its dirty flag; reverting every
        // cell drops the override entirely.
        const refValues = backendEntry ? entryToValues(backendEntry) : EMPTY_VALUES;
        const dirtyCols = computeDirtyCols(nextValues, refValues);

        if (dirtyCols.size === 0) {
          if (!existing) return prev;
          const { [pondKey]: _omit, ...rest } = bucket;
          return { ...prev, [dKey]: rest };
        }

        // Skip ghost overrides when the user advances past a pond without
        // typing (numpad → Next with value='') — otherwise saveAll would
        // persist {0,0,0,0,0} and inflate savedCount on refetch.
        const allEmpty = CELL_KEYS.every((k) => nextValues[k] === '');
        if (allEmpty && !backendEntry) {
          if (!existing) return prev;
          const { [pondKey]: _omit, ...rest } = bucket;
          return { ...prev, [dKey]: rest };
        }

        return {
          ...prev,
          [dKey]: {
            ...bucket,
            [pondKey]: { v: nextValues, dirtyCols },
          },
        };
      });
    },
    [dKey, entriesByPondId],
  );

  const advanceActive = useCallback(() => {
    // Snake through every column; null closes the numpad (finish).
    setActiveCell((cur) => (cur ? nextSnakeCell(cur, ponds) : null));
  }, [ponds]);

  // True when there's nowhere left to advance — the numpad's primary button
  // should read "เสร็จสิ้น" and commit-then-close instead of "ถัดไป".
  const activeCellIsLast = useMemo(
    () => (activeCell ? nextSnakeCell(activeCell, ponds) == null : false),
    [activeCell, ponds],
  );

  const saveAll = useCallback(async (): Promise<SaveResult> => {
    // Gather every drafted (pond, day) in the CURRENT month, grouped by pond.
    // Each pond becomes ONE multi-day upsert: the backend (BulkUpsert at
    // backend/src/internal/service/daily_log_service.go:272) merges the
    // entries[] into the month and leaves other days untouched. Feed IDs are
    // pond-level, so one pair of IDs covers all of the pond's days.
    const byPond = new Map<string, DailyLogEntry[]>();
    // Save-start snapshot of every current-month drafted (pond, day), so the
    // post-save drop can skip any override the user re-edited mid-flight (save is non-blocking —
    // the table stays editable while the request is in the air).
    const sentByKey = new Map<string, CellValues>();
    // (pond, day) pairs deliberately left out of the payload because they hold
    // nothing to persist ({0,0,0,0,0} with no backend entry). They carry no
    // unsaved data, so a save clears them even though they were never sent.
    const noopKeys = new Set<string>();
    for (const [dk, bucket] of Object.entries(overridesRef.current)) {
      if (dKeyMonth(dk) !== month) continue;
      const entryDay = dKeyDay(dk);
      for (const [pondKey, ovr] of Object.entries(bucket)) {
        // Snapshot EVERY current-month drafted (pond, day) value up front — the
        // post-save drop compares live overrides against this to clear saved
        // days (and no-op days) while keeping any re-edited mid-flight. Recorded
        // before the skip below so a skipped day can still be cleared.
        sentByKey.set(`${pondKey} ${dk}`, ovr.v);
        // Every override is dirty by construction (setCellValue drops overrides
        // matching the backend ref). Defensive: skip a {0,0,0,0,0} draft unless
        // it overwrites an existing backend entry on THAT day (user cleared
        // previously-saved cells). Read the per-day backend state from the
        // cached monthly GET, not the selected-day `entriesByPondId`.
        const hasAnyData = CELL_KEYS.some((k) => {
          const v = ovr.v[k];
          return v !== '' && Number(v) !== 0;
        });
        if (!hasAnyData) {
          const cached = qc.getQueryData<DailyLogResponse>(
            dailyLogKeys.month(Number(pondKey), month),
          );
          const hadEntry = cached?.entries.some((e) => e.day === entryDay) ?? false;
          if (!hadEntry) {
            noopKeys.add(`${pondKey} ${dk}`);
            continue;
          }
        }
        const entry: DailyLogEntry = {
          day: entryDay,
          fresh: Number(ovr.v.fresh) || 0,
          pelletMorning: Number(ovr.v.pm) || 0,
          pelletEvening: Number(ovr.v.pe) || 0,
          deathFishCount: Number(ovr.v.death) || 0,
          touristCatchCount: Number(ovr.v.cat) || 0,
        };
        const list = byPond.get(pondKey);
        if (list) list.push(entry);
        else byPond.set(pondKey, [entry]);
      }
    }
    // No early bail-out when byPond is empty: allSettled([]) resolves cleanly,
    // and the drop below still needs to run to clear any no-op drafts.
    const results = await Promise.allSettled(
      Array.from(byPond.entries()).map(async ([pondKey, entries]) => {
        const feeds = feedCollectionsByPondId.get(Number(pondKey));
        const userPick = feedSelections[pondKey];
        const payload = {
          month,
          // User's numpad pick beats the GET-derived default — the picker is
          // the source of truth at the moment of save.
          freshFeedCollectionId: userPick?.fresh ?? feeds?.fresh,
          pelletFeedCollectionId: userPick?.pellet ?? feeds?.pellet,
          entries,
        };
        try {
          const response = await upsertDailyLogMonth(Number(pondKey), payload);
          return { pondKey, response };
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
        successKeys.add(r.value.pondKey);
        // Prime the React Query cache with the (multi-day) upsert response so
        // rows render saved values without a refetch round-trip.
        qc.setQueryData(dailyLogKeys.month(Number(r.value.pondKey), month), r.value.response);
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

    if (successKeys.size > 0 || noopKeys.size > 0) {
      // Drop overrides that a save resolved: every current-month day of a pond
      // whose upsert succeeded (one upsert saves the whole month), plus no-op
      // days that never needed saving. Failed ponds keep their (real) day
      // overrides so the user can retry. Other months are left untouched.
      setOverrides((prev) => {
        let changed = false;
        const next: OverrideMap = {};
        for (const [dk, bucket] of Object.entries(prev)) {
          if (dKeyMonth(dk) !== month) {
            next[dk] = bucket;
            continue;
          }
          const nextBucket: Record<string, LocalOverride> = {};
          for (const [pondKey, o] of Object.entries(bucket)) {
            const key = `${pondKey} ${dk}`;
            if (successKeys.has(pondKey) || noopKeys.has(key)) {
              // Drop only if the value still matches the save-start snapshot —
              // if the user re-edited this cell while the save was in flight,
              // keep the override dirty so their edit isn't silently discarded.
              const snap = sentByKey.get(key);
              const unchanged =
                snap != null && CELL_KEYS.every((k) => valuesEqual(o.v[k], snap[k]));
              if (unchanged) {
                changed = true;
                continue;
              }
            }
            nextBucket[pondKey] = o;
          }
          if (Object.keys(nextBucket).length > 0) next[dk] = nextBucket;
          else changed = true;
        }
        return changed ? next : prev;
      });
    }

    return { ok: failedCount === 0, failedCount, errorCode, errorMessage, errorDetails };
    // `overrides` is read via `overridesRef.current`, not the closure, so it's
    // intentionally not a dependency — that's what keeps saveAll from ever
    // acting on a stale draft set.
  }, [month, qc, feedCollectionsByPondId, feedSelections]);

  const discardDirty = useCallback(() => {
    // Guard "discard" — drop every draft in the CURRENT month (all its days).
    // Saved values reappear from the React Query cache. Other months untouched.
    setOverrides((prev) => {
      let changed = false;
      const next: OverrideMap = {};
      for (const [dk, bucket] of Object.entries(prev)) {
        if (dKeyMonth(dk) === month) changed = true;
        else next[dk] = bucket;
      }
      return changed ? next : prev;
    });
  }, [month]);

  const refresh = useCallback(async () => {
    // Pull-to-refresh: re-pull both the pond list (status / cycle changes) and
    // every month's daily-log entries so the table reflects edits made on
    // other devices since the screen was opened.
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['ponds'] }),
      qc.invalidateQueries({ queryKey: ['dailyLog'] }),
    ]);
  }, [qc]);

  const dirtyCount = useMemo(() => ponds.filter((p) => p.state === 'dirty').length, [ponds]);
  const savedCount = useMemo(() => ponds.filter((p) => p.state === 'saved').length, [ponds]);
  // Block save while any active pond carries an out-of-range value. Only
  // active rows are counted — locked rows (maintenance / closed cycle)
  // render their historical values read-only and can't be touched anyway.
  const invalidCount = useMemo(
    () =>
      ponds.filter((p) => !p.disabled && COLS.some((c) => isCellValueInvalid(p.v[c.key]))).length,
    [ponds],
  );
  // Walk every date with overrides. Any non-empty bucket means dirty (we
  // drop overrides on save / revert). Keys are the dKey form "YYYY-MM-DD"
  // so we can parse year/month directly without re-deriving from a Date.
  const unsavedMonths = useMemo<ReadonlySet<string>>(() => {
    const out = new Set<string>();
    for (const [k, bucket] of Object.entries(overrides)) {
      if (Object.keys(bucket).length === 0) continue;
      // dKey shape: YYYY-MM-DD. Slice the year and month parts and convert
      // the 1-based month string back to the 0-based index the picker uses.
      const y = Number(k.slice(0, 4));
      const m = Number(k.slice(5, 7)) - 1;
      if (Number.isFinite(y) && Number.isFinite(m)) out.add(`${y}-${m}`);
    }
    return out;
  }, [overrides]);
  const daysWithDrafts = useMemo<ReadonlySet<string>>(() => {
    const out = new Set<string>();
    for (const [k, bucket] of Object.entries(overrides)) {
      if (Object.keys(bucket).length > 0) out.add(k);
    }
    return out;
  }, [overrides]);
  // Counter denominator = ponds the user must log for today (active only).
  // Maintenance ponds appear in the table but aren't counted toward progress.
  const total = useMemo(() => ponds.filter((p) => !p.disabled).length, [ponds]);
  const maintenanceCount = useMemo(() => ponds.filter((p) => p.maintenance).length, [ponds]);

  // Single walk over the CURRENT month's drafts producing everything the
  // month-wide save UI needs: the SaveBar counters, the save-gate invalid
  // count, and the by-feed-type summary for the confirm sheet. Recomputes only
  // when overrides / month change — live typing bypasses `overrides` via
  // `liveValue`, so this stays off the keystroke path (same trigger as the
  // unsavedMonths / daysWithDrafts walks above).
  const monthPending = useMemo(() => {
    const num = (x: number | '') => (typeof x === 'number' ? x : 0);
    const days = new Set<string>();
    const pondSet = new Set<string>();
    let editsCount = 0;
    let invalidCount = 0;
    let pelletTotal = 0;
    let freshTotal = 0;
    let deathTotal = 0;
    const pelletDays = new Set<string>();
    const freshDays = new Set<string>();
    const deathDays = new Set<string>();

    for (const [dk, bucket] of Object.entries(overrides)) {
      if (dKeyMonth(dk) !== month) continue;
      for (const [pondKey, ovr] of Object.entries(bucket)) {
        editsCount += 1;
        days.add(dk);
        pondSet.add(pondKey);
        if (COLS.some((c) => isCellValueInvalid(ovr.v[c.key]))) invalidCount += 1;
        const pellet = num(ovr.v.pm) + num(ovr.v.pe);
        const fresh = num(ovr.v.fresh);
        const death = num(ovr.v.death);
        if (pellet > 0) {
          pelletTotal += pellet;
          pelletDays.add(dk);
        }
        if (fresh > 0) {
          freshTotal += fresh;
          freshDays.add(dk);
        }
        if (death > 0) {
          deathTotal += death;
          deathDays.add(dk);
        }
      }
    }

    const summary: MonthSummary = {
      month,
      daysEdited: days.size,
      pondCount: pondSet.size,
      pellet: { total: pelletTotal, days: pelletDays.size },
      fresh: { total: freshTotal, days: freshDays.size },
      death: { total: deathTotal, days: deathDays.size },
    };
    return { editsCount, daysCount: days.size, pondCount: pondSet.size, invalidCount, summary };
  }, [overrides, month]);
  const monthEditsCount = monthPending.editsCount;
  const monthDaysCount = monthPending.daysCount;
  const monthPondCount = monthPending.pondCount;
  const monthInvalidCount = monthPending.invalidCount;
  const monthSummary = monthPending.summary;

  return {
    ponds,
    loading,
    selectedDate,
    setSelectedDate,
    activeCell,
    setActiveCell,
    dirtyCount,
    savedCount,
    invalidCount,
    total,
    maintenanceCount,
    unsavedMonths,
    daysWithDrafts,
    monthEditsCount,
    monthDaysCount,
    monthPondCount,
    monthInvalidCount,
    monthSummary,
    setCellValue,
    setFeedSelection,
    lastUsedFeedIdForActiveCell,
    advanceActive,
    activeCellIsLast,
    saveAll,
    discardDirty,
    refresh,
  };
}
