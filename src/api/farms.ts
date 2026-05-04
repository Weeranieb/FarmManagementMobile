import { api } from './client';
import type { FarmResponse } from './types';

export const farmsApi = {
  list: (): Promise<FarmResponse[]> => api.get('/farm'),
  get: (id: number): Promise<FarmResponse> => api.get(`/farm/${id}`),
};
