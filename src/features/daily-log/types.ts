// DTOs mirroring backend/src/internal/dto/daily-log. Keep in sync as the API evolves.

export type DailyLogEntry = {
  day: number;
  freshMorning: number;
  freshEvening: number;
  pelletMorning: number;
  pelletEvening: number;
  deathFishCount: number;
  touristCatchCount: number;
};

export type DailyLogResponse = {
  pondId: number;
  month: string;
  freshFeedCollectionId: number;
  freshFeedCollectionName: string;
  pelletFeedCollectionId: number;
  pelletFeedCollectionName: string;
  entries: DailyLogEntry[];
};

export type DailyLogUpsertRequest = {
  month: string; // YYYY-MM
  freshFeedCollectionId?: number;
  pelletFeedCollectionId?: number;
  entries: DailyLogEntry[];
};
