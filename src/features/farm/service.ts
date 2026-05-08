import { http } from '@/shared/http';
import type { FarmDetailResponse, FarmListResponse, FarmResponse } from './types';

function normalizeFarmListPayload(body: unknown): FarmResponse[] {
  if (Array.isArray(body)) {
    return body as FarmResponse[];
  }
  if (
    body !== null &&
    typeof body === 'object' &&
    Array.isArray((body as FarmListResponse).farms)
  ) {
    return (body as FarmListResponse).farms;
  }
  return [];
}

export async function listFarms(): Promise<FarmResponse[]> {
  const payload = await http.get<unknown>('/farm');
  return normalizeFarmListPayload(payload);
}

export function getFarm(id: number): Promise<FarmDetailResponse> {
  return http.get(`/farm/${id}`);
}
