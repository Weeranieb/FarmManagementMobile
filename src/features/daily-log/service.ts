import { http } from '@/shared/http';
import type { DailyLogResponse, DailyLogUpsertRequest } from './types';

export function getDailyLogMonth(pondId: number, month: string): Promise<DailyLogResponse> {
  return http.get(`/pond/${pondId}/daily-logs`, { month });
}

export function upsertDailyLogMonth(
  pondId: number,
  body: DailyLogUpsertRequest,
): Promise<DailyLogResponse> {
  return http.put(`/pond/${pondId}/daily-logs`, body);
}
