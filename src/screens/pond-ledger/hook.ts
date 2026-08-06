import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useDailyLogData,
  useUpsertDailyLog,
  loadLedgerDrafts,
  saveLedgerDrafts,
  monthStrFromDate,
  addMonthsStr,
  daysInMonthFromStr,
  type DailyLogEntry,
  type DailyLogUpsertRequest,
} from '@/features/daily-log';
import { useAuthStore } from '@/features/auth';
import { apiErrorStatus } from '@/shared/http';
import i18n from '@/locale/i18n';
import { usePondData, usePondActivitiesData, type PondActivityModel } from '@/features/pond';
import { ALL_COLS, isCellValueInvalid, type ColKey } from '@/screens/daily-log/constants';
import type { MonthSummary } from '@/screens/daily-log/hook';

/** One editable day's five values, empty string = untouched/absent. */
export type CellValues = {
  pm: number | '';
  pe: number | '';
  fresh: number | '';
  death: number | '';
  cat: number | '';
};

export type Editing = { day: number; col: ColKey } | null;

const EMPTY_VALUES: CellValues = { pm: '', pe: '', fresh: '', death: '', cat: '' };
/** Stable empty reference so a month with no drafts doesn't thrash memo deps. */
const EMPTY_DRAFTS: Record<number, CellValues> = {};
const CELL_KEYS: readonly (keyof CellValues)[] = ['pm', 'pe', 'fresh', 'death', 'cat'];
/** Column order the keypad's "ถัดไป" walks within a day before wrapping to the
 *  next day. Unlike the farm-daily snake, the pond ledger visits every column
 *  (a farmer fills one day fully at a time). */
export const COL_ORDER: readonly ColKey[] = ['pm', 'pe', 'fresh', 'death', 'cat'];

function entryToValues(e: DailyLogEntry): CellValues {
  return {
    pm: e.pelletMorning,
    pe: e.pelletEvening,
    fresh: e.fresh,
    death: e.deathFishCount,
    cat: e.touristCatchCount ?? '',
  };
}

function toNum(v: number | ''): number {
  return v === '' ? 0 : Number(v);
}

function valuesEqual(a: CellValues, b: CellValues): boolean {
  return CELL_KEYS.every((k) => toNum(a[k]) === toNum(b[k]));
}

function isEmptyValues(v: CellValues): boolean {
  return CELL_KEYS.every((k) => v[k] === '' || Number(v[k]) === 0);
}

export function usePondLedgerScreen(pondId: number, ymProp?: string) {
  // Resolve "now" once at mount — the module-load `today` constant would stale
  // across midnight and wrongly gate the new day as a future (uneditable) cell.
  const [refNow] = useState(() => new Date());
  const currentMonthStr = monthStrFromDate(refNow);

  const [ym, setYm] = useState(ymProp ?? currentMonthStr);
  // Drafts are keyed by month (YYYY-MM) so unsaved edits in one month never
  // bleed into another when the user navigates the month arrows. Restored from
  // MMKV so a force-quit / OS eviction doesn't discard unsaved entry — see
  // features/daily-log/drafts.ts.
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [restored] = useState(() => ({ userId, ...loadLedgerDrafts(userId, pondId) }));
  const [draftsByMonth, setDraftsByMonth] = useState<Record<string, Record<number, CellValues>>>(
    restored.draftsByMonth,
  );
  const drafts = draftsByMonth[ym] ?? EMPTY_DRAFTS;
  // Feed-collection picks made in the keypad (per group) win over the ids the
  // month GET returned — mirrors the daily-log editor's save contract.
  const [feedPick, setFeedPick] = useState<{ pellet?: number; fresh?: number }>(restored.feedPick);
  const [editing, setEditing] = useState<Editing>(null);

  // Mirror drafts to disk on every change (synchronous MMKV write of a small
  // blob). Skipped unless the session still belongs to the user we restored
  // for, so an identity change can't persist this hook's state over theirs.
  useEffect(() => {
    if (userId == null || userId !== restored.userId) return;
    saveLedgerDrafts(userId, pondId, { draftsByMonth, feedPick });
  }, [userId, restored.userId, pondId, draftsByMonth, feedPick]);

  const { data: pond } = usePondData(Number.isFinite(pondId) ? pondId : undefined);
  const { data: log, isLoading, isError } = useDailyLogData(pondId, ym);
  const { data: activities } = usePondActivitiesData(Number.isFinite(pondId) ? pondId : undefined);
  const upsert = useUpsertDailyLog(pondId);

  const ymParts = ym.split('-');
  const year = Number(ymParts[0]);
  const m0 = Number(ymParts[1]) - 1;
  const nDays = daysInMonthFromStr(ym);
  const monthDate = useMemo(() => new Date(year, m0, 1), [year, m0]);
  const isCurrentMonth = year === refNow.getFullYear() && m0 === refNow.getMonth();
  const todayDate = refNow.getDate();

  const serverByDay = useMemo<Record<number, DailyLogEntry>>(() => {
    const out: Record<number, DailyLogEntry> = {};
    (log?.entries ?? []).forEach((e) => {
      out[e.day] = e;
    });
    return out;
  }, [log]);

  // Map each server entry to CellValues once per fetch. Stable object refs let
  // memoized rows for unedited days skip re-render while another day is being
  // typed — without this, `entryToValues` minted a fresh object every render so
  // every row re-rendered on each keystroke.
  const serverValues = useMemo<Record<number, CellValues>>(() => {
    const out: Record<number, CellValues> = {};
    for (const e of Object.values(serverByDay)) out[e.day] = entryToValues(e);
    return out;
  }, [serverByDay]);

  const valuesForDay = useCallback(
    (day: number): CellValues => drafts[day] ?? serverValues[day] ?? EMPTY_VALUES,
    [drafts, serverValues],
  );

  // A day is "logged" (renders tall, counts toward totals) when the server has
  // it OR a draft carries data for it.
  const loggedDays = useMemo(() => {
    const set = new Set<number>();
    Object.keys(serverByDay).forEach((d) => set.add(Number(d)));
    Object.entries(drafts).forEach(([d, v]) => {
      if (!isEmptyValues(v)) set.add(Number(d));
      else set.delete(Number(d));
    });
    return set;
  }, [serverByDay, drafts]);

  const totals = useMemo(() => {
    const acc = { pm: 0, pe: 0, fresh: 0, death: 0, cat: 0 };
    loggedDays.forEach((day) => {
      const v = valuesForDay(day);
      acc.pm += toNum(v.pm);
      acc.pe += toNum(v.pe);
      acc.fresh += toNum(v.fresh);
      acc.death += toNum(v.death);
      acc.cat += toNum(v.cat);
    });
    return {
      ...acc,
      feedBags: acc.pm + acc.pe,
      loggedDays: loggedDays.size,
    };
  }, [loggedDays, valuesForDay]);

  // Real fill/move/sell records that landed on a day of the displayed month,
  // grouped by day-of-month — threaded under the matching row as annotations.
  const eventsByDay = useMemo<Record<number, PondActivityModel[]>>(() => {
    const out: Record<number, PondActivityModel[]> = {};
    (activities ?? []).forEach((a) => {
      // a.date is a local `YYYY-MM-DD` (backend activityDate). Parse the parts
      // directly — `new Date('YYYY-MM-DD')` is UTC midnight and would shift the
      // day in negative-UTC timezones.
      const parts = a.date.slice(0, 10).split('-');
      const ay = Number(parts[0]);
      const am = Number(parts[1]);
      const ad = Number(parts[2]);
      if (!Number.isFinite(ad) || ay !== year || am - 1 !== m0) return;
      (out[ad] ??= []).push(a);
    });
    return out;
  }, [activities, year, m0]);

  const dirtyDays = useMemo(() => {
    const days: number[] = [];
    Object.entries(drafts).forEach(([d, v]) => {
      const day = Number(d);
      const server = serverByDay[day];
      const ref = server ? entryToValues(server) : EMPTY_VALUES;
      if (!valuesEqual(v, ref)) days.push(day);
    });
    return days.sort((a, b) => a - b);
  }, [drafts, serverByDay]);

  const invalidCount = useMemo(
    () =>
      dirtyDays.filter((day) => {
        const v = valuesForDay(day);
        return COL_ORDER.some((c) => isCellValueInvalid(v[c]));
      }).length,
    [dirtyDays, valuesForDay],
  );

  // By-feed-type recap of the days about to be saved — feeds the confirm sheet
  // (same shape/component as the farm daily-log). Single pond ⇒ pondCount 1.
  const saveSummary = useMemo<MonthSummary>(() => {
    let pelletTotal = 0;
    let freshTotal = 0;
    let deathTotal = 0;
    let pelletDays = 0;
    let freshDays = 0;
    let deathDays = 0;
    dirtyDays.forEach((day) => {
      const v = valuesForDay(day);
      const pellet = toNum(v.pm) + toNum(v.pe);
      const fresh = toNum(v.fresh);
      const death = toNum(v.death);
      if (pellet > 0) {
        pelletTotal += pellet;
        pelletDays += 1;
      }
      if (fresh > 0) {
        freshTotal += fresh;
        freshDays += 1;
      }
      if (death > 0) {
        deathTotal += death;
        deathDays += 1;
      }
    });
    return {
      month: ym,
      daysEdited: dirtyDays.length,
      pondCount: dirtyDays.length > 0 ? 1 : 0,
      pellet: { total: pelletTotal, days: pelletDays },
      fresh: { total: freshTotal, days: freshDays },
      death: { total: deathTotal, days: deathDays },
    };
  }, [dirtyDays, valuesForDay, ym]);

  const setCell = useCallback(
    (day: number, col: ColKey, value: number | '', feedId?: number | null) => {
      setDraftsByMonth((prev) => {
        const cur = prev[ym] ?? {};
        const server = serverByDay[day];
        const refValues = server ? entryToValues(server) : EMPTY_VALUES;
        const base = cur[day] ?? refValues;
        const next: CellValues = { ...base, [col]: value };
        // Reverting every cell back to the server value drops the draft.
        if (valuesEqual(next, refValues)) {
          if (!cur[day]) return prev;
          const { [day]: _omit, ...restDays } = cur;
          return { ...prev, [ym]: restDays };
        }
        return { ...prev, [ym]: { ...cur, [day]: next } };
      });
      if (feedId != null) {
        const group = ALL_COLS.find((c) => c.key === col)?.group;
        if (group === 'pellet') setFeedPick((p) => ({ ...p, pellet: feedId }));
        else if (group === 'fresh') setFeedPick((p) => ({ ...p, fresh: feedId }));
      }
    },
    [ym, serverByDay],
  );

  const isFutureDay = useCallback(
    (day: number) => isCurrentMonth && day > todayDate,
    [isCurrentMonth, todayDate],
  );

  const openCell = useCallback(
    (day: number, col: ColKey) => {
      if (isFutureDay(day)) return;
      setEditing({ day, col });
    },
    [isFutureDay],
  );

  const advance = useCallback(() => {
    setEditing((cur) => {
      if (!cur) return null;
      const lastDay = isCurrentMonth ? Math.min(todayDate, nDays) : nDays;
      // "ถัดไป" walks DOWN the current column (day → day+1) so the farmer fills
      // one column top-to-bottom: 1 เช้า → 2 เช้า → 3 เช้า …
      if (cur.day < lastDay) return { day: cur.day + 1, col: cur.col };
      // Bottom of the column — wrap to the first day of the next column.
      const ci = COL_ORDER.indexOf(cur.col);
      const nextCol = COL_ORDER[ci + 1];
      if (nextCol) return { day: 1, col: nextCol };
      return null;
    });
  }, [nDays, isCurrentMonth, todayDate]);

  const isLastCell = useMemo(() => {
    if (!editing) return false;
    const lastDay = isCurrentMonth ? Math.min(todayDate, nDays) : nDays;
    // Last cell = bottom of the final column (nothing left to walk down/into).
    if (editing.day < lastDay) return false;
    const ci = COL_ORDER.indexOf(editing.col);
    return COL_ORDER[ci + 1] == null;
  }, [editing, nDays, isCurrentMonth, todayDate]);

  const lastUsedFeedId = useMemo<number | null>(() => {
    if (!editing) return null;
    const group = ALL_COLS.find((c) => c.key === editing.col)?.group;
    if (group === 'pellet') return feedPick.pellet ?? log?.pelletFeedCollectionId ?? null;
    if (group === 'fresh') return feedPick.fresh ?? log?.freshFeedCollectionId ?? null;
    return null;
  }, [editing, feedPick, log]);

  // Clamp month nav to the pond's cycle: no earlier than the start (เริ่มรอบ)
  // month, no later than the current month. `YYYY-MM` compares as strings.
  const startMonth = pond?.startDate ? monthStrFromDate(new Date(pond.startDate)) : null;
  const canGoPrev = startMonth == null || ym > startMonth;

  // Bounds for the month/year picker sheet ({ y, m } with 0-based month).
  const startYm = useMemo(() => {
    if (!startMonth) return null;
    const parts = startMonth.split('-');
    return { y: Number(parts[0]), m: Number(parts[1]) - 1 };
  }, [startMonth]);
  const todayYm = useMemo(() => ({ y: refNow.getFullYear(), m: refNow.getMonth() }), [refNow]);

  const setMonth = useCallback((next: string) => {
    setYm(next);
    setEditing(null);
  }, []);
  const goToMonth = useCallback(
    (y: number, monthIdx: number) => {
      setMonth(`${y}-${String(monthIdx + 1).padStart(2, '0')}`);
    },
    [setMonth],
  );
  const goPrevMonth = useCallback(() => {
    if (startMonth != null && ym <= startMonth) return;
    setMonth(addMonthsStr(ym, -1));
  }, [ym, startMonth, setMonth]);
  const goNextMonth = useCallback(() => {
    if (isCurrentMonth) return;
    setMonth(addMonthsStr(ym, 1));
  }, [ym, isCurrentMonth, setMonth]);

  // Fires the upsert and reports the outcome back to the view, which drives the
  // confirm sheet → status toast (saving → success/error). No Alert here: the
  // toast owns the result surface, matching the farm daily-log.
  const save = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (dirtyDays.length === 0 || invalidCount > 0) return { ok: false };
    const entries: DailyLogEntry[] = dirtyDays.map((day) => {
      const v = valuesForDay(day);
      return {
        day,
        pelletMorning: toNum(v.pm),
        pelletEvening: toNum(v.pe),
        fresh: toNum(v.fresh),
        deathFishCount: toNum(v.death),
        touristCatchCount: toNum(v.cat),
      };
    });
    const body: DailyLogUpsertRequest = {
      month: ym,
      pelletFeedCollectionId: feedPick.pellet ?? log?.pelletFeedCollectionId,
      freshFeedCollectionId: feedPick.fresh ?? log?.freshFeedCollectionId,
      entries,
    };
    try {
      await upsert.mutateAsync(body);
      // Server truth returns via the month query invalidation in the mutation.
      // Clear only this month's drafts; other months keep their pending edits.
      setDraftsByMonth((prev) => {
        const { [ym]: _omit, ...rest } = prev;
        return rest;
      });
      setFeedPick({});
      setEditing(null);
      return { ok: true };
    } catch (err) {
      // Nothing reached the server (fetch threw — no HTTP status): the entry is
      // still on disk, so say that rather than "save failed", which reads as
      // "retype it".
      if (apiErrorStatus(err) == null) {
        return { ok: false, error: i18n.t('offlineSave.kept') };
      }
      const message =
        (err as { message?: string; details?: string })?.details ??
        (err as { message?: string })?.message ??
        i18n.t('pondLedger.saveFailed');
      return { ok: false, error: message };
    }
  }, [dirtyDays, invalidCount, valuesForDay, ym, feedPick, log, upsert]);

  // Drop the current month's drafts (used by the "leave without saving" path of
  // the unsaved-changes prompt). Other months keep their pending edits, mirroring
  // `save`'s cleanup.
  const discardMonth = useCallback(() => {
    setDraftsByMonth((prev) => {
      if (!(ym in prev)) return prev;
      const { [ym]: _omit, ...rest } = prev;
      return rest;
    });
    setEditing(null);
  }, [ym]);

  return {
    pond,
    isLoading,
    isError,
    ym,
    monthDate,
    nDays,
    year,
    m0,
    isCurrentMonth,
    todayDate,
    serverByDay,
    valuesForDay,
    loggedDays,
    totals,
    eventsByDay,
    dirtyDays,
    invalidCount,
    saveSummary,
    editing,
    lastUsedFeedId,
    isLastCell,
    saving: upsert.isPending,
    canGoPrev,
    startYm,
    todayYm,
    isFutureDay,
    setCell,
    openCell,
    advance,
    closeKeypad: () => setEditing(null),
    goPrevMonth,
    goNextMonth,
    goToMonth,
    save,
    discardMonth,
  };
}

export type PondLedgerState = ReturnType<typeof usePondLedgerScreen>;
