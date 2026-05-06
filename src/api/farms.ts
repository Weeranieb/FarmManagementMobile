import { api } from './client';
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

export const farmsApi = {
  list: async (): Promise<FarmResponse[]> =>
    normalizeFarmListPayload(await api.get<unknown>('/farm')),
  get: (id: number): Promise<FarmDetailResponse> => api.get(`/farm/${id}`),
};
