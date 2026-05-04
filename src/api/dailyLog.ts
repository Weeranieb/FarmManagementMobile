import { api } from './client';
import type { DailyLogEntry, DailyLogResponse } from './types';

export type DailyLogUpsertRequest = {
  month: string; // YYYY-MM
  freshFeedCollectionId?: number;
  pelletFeedCollectionId?: number;
  entries: DailyLogEntry[];
};

export const dailyLogApi = {
  getMonth: (pondId: number, month: string): Promise<DailyLogResponse> =>
    api.get(`/pond/${pondId}/daily-logs`, { month }),
  upsertMonth: (pondId: number, body: DailyLogUpsertRequest): Promise<DailyLogResponse> =>
    api.put(`/pond/${pondId}/daily-logs`, body),
};
