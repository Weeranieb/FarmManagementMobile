// DTOs mirroring backend/src/internal/dto/daily-log. Keep in sync as the API evolves.

export type DailyLogEntry = {
  /** Row id — present on saved entries; absent on locally-built drafts. */
  id?: number;
  day: number;
  fresh: number;
  pelletMorning: number;
  pelletEvening: number;
  deathFishCount: number;
  // Backend column is nullable (`tourist_catch_count` dropped NOT NULL) and the
  // response has no `omitempty`, so it comes back as `null` for days it was
  // never set on. Requests may send a number (0 = none) or omit it.
  touristCatchCount: number | null;
  // Per-entry per-pack unit price the backend resolved from the feed collection
  // for the entry's date — ฿/ลัง for fresh, ฿/ถุง for pellet, matching how each
  // is logged. `omitempty` server-side → undefined when the feed type has no
  // collection / price configured. Used to derive feed cost.
  freshUnitPrice?: number;
  pelletUnitPrice?: number;
};

export type DailyLogResponse = {
  pondId: number;
  month: string;
  // Backend returns `*int` with omitempty — undefined when the pond has no
  // feed collection configured for that feed type.
  freshFeedCollectionId?: number;
  freshFeedCollectionName: string;
  pelletFeedCollectionId?: number;
  pelletFeedCollectionName: string;
  // Display units for each feed type (fresh "ลัง", pellet "ถุง"). Omitted by
  // older responses.
  freshUnit?: string;
  pelletUnit?: string;
  entries: DailyLogEntry[];
};

export type DailyLogUpsertRequest = {
  month: string; // YYYY-MM
  freshFeedCollectionId?: number;
  pelletFeedCollectionId?: number;
  entries: DailyLogEntry[];
};
