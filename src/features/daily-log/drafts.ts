// Persisted daily-log drafts (MMKV).
//
// Both editors — the farm-wide grid (screens/daily-log) and the per-pond ledger
// (screens/pond-ledger) — keep unsaved cell edits in React state and only drop
// them once the server confirms the upsert. That's the right save semantics, but
// it made the drafts process-lifetime only: an app the OS evicts while
// backgrounded, a crash, or a force-quit took a whole day of field entry with
// it, and the "รออัปโหลด" pill silently reset to zero. Drafts are written here
// on every change and restored on mount, so pending edits survive a restart and
// the user can still hit save once they're back in signal.
//
// Contents are feed weights / fish counts — not sensitive — so plain MMKV is
// fine (auth material stays in expo-secure-store).

import { readJson, removeKey, writeJson } from '@/lib/mmkv';
import { toIsoDate, toMonthKey } from '@/shared/time';

/** Bump when a persisted shape changes — a mismatch discards the blob. */
const SCHEMA = 1;

/**
 * Drafts older than this are dropped on read. Nothing in the UI ever expires a
 * draft, so without a cutoff an abandoned edit would sit in storage forever and
 * resurface months later as a save candidate. Two months keeps "let me finish
 * last month's log" working while bounding growth.
 */
const MAX_AGE_DAYS = 62;

/** One cell's value. `''` = untouched/cleared, mirroring the editors' CellValues. */
export type DraftCell = number | '';

/** The five editable columns of a daily-log day. Structurally identical to both
 *  editors' local `CellValues`, so values pass either way without a cast. */
export type DraftValues = {
  pm: DraftCell;
  pe: DraftCell;
  fresh: DraftCell;
  death: DraftCell;
  cat: DraftCell;
};

type CellKey = keyof DraftValues;

const CELL_KEYS: readonly CellKey[] = ['pm', 'pe', 'fresh', 'death', 'cat'];

/** Feed-collection picks made in the keypad, per feed group. */
export type DraftFeedPick = { pellet?: number; fresh?: number };

/** One drafted (pond, day) in the farm-wide grid. */
export type GridDraft = { v: DraftValues; dirtyCols: ReadonlySet<CellKey> };

export type GridDrafts = {
  /** `YYYY-MM-DD` → pond id (string) → draft. */
  overrides: Record<string, Record<string, GridDraft>>;
  /** Pond id (string) → keypad feed pick. */
  feedSelections: Record<string, DraftFeedPick>;
};

export type LedgerDrafts = {
  /** `YYYY-MM` → day-of-month → values. */
  draftsByMonth: Record<string, Record<number, DraftValues>>;
  feedPick: DraftFeedPick;
};

const EMPTY_GRID: GridDrafts = { overrides: {}, feedSelections: {} };
const EMPTY_LEDGER: LedgerDrafts = { draftsByMonth: {}, feedPick: {} };

// Keyed per user so a shared device (owner + worker) never shows one login's
// pending edits to another. Drafts deliberately survive logout — they're the
// user's own unsaved work, and they come back on their next login.
const gridKey = (userId: number): string => `farmos.drafts.dailyLog.${userId}`;
const ledgerKey = (userId: number): string => `farmos.drafts.pondLedger.${userId}`;

// ─── stored shapes (untrusted — every field is validated on read) ─────────────

type StoredGridDraft = { v: DraftValues; dirty: CellKey[] };
type StoredGrid = {
  v: number;
  days: Record<string, Record<string, StoredGridDraft>>;
  feeds: Record<string, DraftFeedPick>;
};

type StoredLedgerPond = {
  months: Record<string, Record<string, DraftValues>>;
  feed: DraftFeedPick;
};
type StoredLedger = { v: number; ponds: Record<string, StoredLedgerPond> };

// ─── validation helpers ──────────────────────────────────────────────────────

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function sanitizeCell(x: unknown): DraftCell | null {
  if (x === '') return '';
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  return null;
}

function sanitizeValues(x: unknown): DraftValues | null {
  if (!isRecord(x)) return null;
  const out = {} as DraftValues;
  for (const k of CELL_KEYS) {
    const cell = sanitizeCell(x[k]);
    if (cell === null) return null;
    out[k] = cell;
  }
  return out;
}

function sanitizeCols(x: unknown): ReadonlySet<CellKey> {
  const out = new Set<CellKey>();
  if (!Array.isArray(x)) return out;
  for (const k of x) {
    if (typeof k === 'string' && (CELL_KEYS as readonly string[]).includes(k)) {
      out.add(k as CellKey);
    }
  }
  return out;
}

function sanitizeFeedPick(x: unknown): DraftFeedPick {
  if (!isRecord(x)) return {};
  const out: DraftFeedPick = {};
  if (typeof x.pellet === 'number' && x.pellet > 0) out.pellet = x.pellet;
  if (typeof x.fresh === 'number' && x.fresh > 0) out.fresh = x.fresh;
  return out;
}

/** Oldest day key (`YYYY-MM-DD`) a draft may carry and still be restored. */
function dayCutoff(): string {
  const d = new Date();
  d.setDate(d.getDate() - MAX_AGE_DAYS);
  return toIsoDate(d);
}

/** Oldest month key (`YYYY-MM`) a draft may carry and still be restored. Whole
 *  months are the ledger's unit, so a month is kept while any of its days is
 *  inside the window. */
function monthCutoff(): string {
  const d = new Date();
  d.setDate(d.getDate() - MAX_AGE_DAYS);
  return toMonthKey(d);
}

const isDayKey = (k: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(k);
const isMonthKey = (k: string): boolean => /^\d{4}-\d{2}$/.test(k);

// ─── farm-wide grid (screens/daily-log) ──────────────────────────────────────

export function loadGridDrafts(userId: number | null): GridDrafts {
  if (userId == null) return EMPTY_GRID;
  const raw = readJson<StoredGrid>(gridKey(userId));
  if (raw == null || raw.v !== SCHEMA || !isRecord(raw.days)) return EMPTY_GRID;

  const cutoff = dayCutoff();
  const overrides: GridDrafts['overrides'] = {};
  const pondsWithDrafts = new Set<string>();

  for (const [dKey, rawBucket] of Object.entries(raw.days)) {
    if (!isDayKey(dKey) || dKey < cutoff || !isRecord(rawBucket)) continue;
    const bucket: Record<string, GridDraft> = {};
    for (const [pondKey, rawDraft] of Object.entries(rawBucket)) {
      if (!isRecord(rawDraft)) continue;
      const v = sanitizeValues(rawDraft.v);
      if (v == null) continue;
      const dirtyCols = sanitizeCols(rawDraft.dirty);
      // The editor drops overrides that match server truth, so a draft with no
      // dirty column is meaningless — don't resurrect one.
      if (dirtyCols.size === 0) continue;
      bucket[pondKey] = { v, dirtyCols };
      pondsWithDrafts.add(pondKey);
    }
    if (Object.keys(bucket).length > 0) overrides[dKey] = bucket;
  }

  // Feed picks are only read while building a pond's save payload, so a pick
  // whose drafts are gone can never be used — dropping it keeps the blob from
  // accumulating one entry per pond the user ever opened the keypad on.
  const feedSelections: GridDrafts['feedSelections'] = {};
  if (isRecord(raw.feeds)) {
    for (const [pondKey, rawPick] of Object.entries(raw.feeds)) {
      if (!pondsWithDrafts.has(pondKey)) continue;
      const pick = sanitizeFeedPick(rawPick);
      if (pick.pellet != null || pick.fresh != null) feedSelections[pondKey] = pick;
    }
  }

  return { overrides, feedSelections };
}

export function saveGridDrafts(userId: number | null, drafts: GridDrafts): void {
  if (userId == null) return;
  const key = gridKey(userId);

  const days: StoredGrid['days'] = {};
  for (const [dKey, bucket] of Object.entries(drafts.overrides)) {
    const stored: Record<string, StoredGridDraft> = {};
    for (const [pondKey, draft] of Object.entries(bucket)) {
      stored[pondKey] = { v: draft.v, dirty: Array.from(draft.dirtyCols) };
    }
    if (Object.keys(stored).length > 0) days[dKey] = stored;
  }

  // Everything saved / discarded — drop the key instead of leaving an empty
  // blob behind (feed picks alone have nothing to apply to).
  if (Object.keys(days).length === 0) {
    removeKey(key);
    return;
  }

  writeJson(key, { v: SCHEMA, days, feeds: drafts.feedSelections } satisfies StoredGrid);
}

// ─── per-pond ledger (screens/pond-ledger) ───────────────────────────────────

/** Read one pond's slice of the user's ledger drafts. */
export function loadLedgerDrafts(userId: number | null, pondId: number): LedgerDrafts {
  if (userId == null || !Number.isFinite(pondId)) return EMPTY_LEDGER;
  const raw = readJson<StoredLedger>(ledgerKey(userId));
  if (raw == null || raw.v !== SCHEMA || !isRecord(raw.ponds)) return EMPTY_LEDGER;
  const pond = raw.ponds[String(pondId)];
  if (!isRecord(pond) || !isRecord(pond.months)) return EMPTY_LEDGER;

  const cutoff = monthCutoff();
  const draftsByMonth: LedgerDrafts['draftsByMonth'] = {};
  for (const [ym, rawDays] of Object.entries(pond.months)) {
    if (!isMonthKey(ym) || ym < cutoff || !isRecord(rawDays)) continue;
    const byDay: Record<number, DraftValues> = {};
    for (const [rawDay, rawValues] of Object.entries(rawDays)) {
      const day = Number(rawDay);
      if (!Number.isInteger(day) || day < 1 || day > 31) continue;
      const v = sanitizeValues(rawValues);
      if (v == null) continue;
      byDay[day] = v;
    }
    if (Object.keys(byDay).length > 0) draftsByMonth[ym] = byDay;
  }

  return { draftsByMonth, feedPick: sanitizeFeedPick(pond.feed) };
}

/**
 * Write one pond's slice back, merging into the user's blob so a second ledger
 * screen's drafts aren't clobbered. Stale months (any pond's) are pruned on the
 * way through — the ledger is the only writer of this key, so a pass here is
 * the natural place for it.
 */
export function saveLedgerDrafts(
  userId: number | null,
  pondId: number,
  drafts: LedgerDrafts,
): void {
  if (userId == null || !Number.isFinite(pondId)) return;
  const key = ledgerKey(userId);
  const existing = readJson<StoredLedger>(key);
  const cutoff = monthCutoff();
  const ponds: StoredLedger['ponds'] = {};

  const keepMonths = (
    months: Record<string, Record<string, DraftValues>>,
  ): Record<string, Record<string, DraftValues>> => {
    const out: Record<string, Record<string, DraftValues>> = {};
    for (const [ym, byDay] of Object.entries(months)) {
      if (!isMonthKey(ym) || ym < cutoff || !isRecord(byDay)) continue;
      if (Object.keys(byDay).length > 0) out[ym] = byDay;
    }
    return out;
  };

  // Other ponds' slices pass through untouched apart from the month prune.
  if (existing != null && existing.v === SCHEMA && isRecord(existing.ponds)) {
    for (const [id, pond] of Object.entries(existing.ponds)) {
      if (id === String(pondId) || !isRecord(pond) || !isRecord(pond.months)) continue;
      const months = keepMonths(pond.months);
      if (Object.keys(months).length > 0) {
        ponds[id] = { months, feed: sanitizeFeedPick(pond.feed) };
      }
    }
  }

  const months = keepMonths(drafts.draftsByMonth as Record<string, Record<string, DraftValues>>);
  if (Object.keys(months).length > 0) {
    ponds[String(pondId)] = { months, feed: drafts.feedPick };
  }

  if (Object.keys(ponds).length === 0) {
    removeKey(key);
    return;
  }

  writeJson(key, { v: SCHEMA, ponds } satisfies StoredLedger);
}
