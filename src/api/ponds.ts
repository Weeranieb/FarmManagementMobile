import { api } from './client';
import type { PondResponse } from './types';

export type FillPondRequest = {
  fishType: string;
  amount: number;
  pricePerUnit?: number;
  remark?: string;
};

export type MovePondRequest = {
  toPondId: number;
  amount: number;
  remark?: string;
};

export type SellPondRequest = {
  amount: number;
  pricePerKg: number;
  merchantId: number;
  sizeGradeId: number;
};

export const pondsApi = {
  list: (farmId?: number): Promise<PondResponse[]> =>
    api.get('/pond', farmId ? { farmId } : undefined),
  get: (id: number): Promise<PondResponse> => api.get(`/pond/${id}`),
  fill: (pondId: number, body: FillPondRequest) => api.post(`/pond/${pondId}/fill`, body),
  move: (pondId: number, body: MovePondRequest) => api.post(`/pond/${pondId}/move`, body),
  sell: (pondId: number, body: SellPondRequest) => api.post(`/pond/${pondId}/sell`, body),
  fillPreview: (pondId: number, body: FillPondRequest) =>
    api.post(`/pond/${pondId}/fill/preview`, body),
  movePreview: (pondId: number, body: MovePondRequest) =>
    api.post(`/pond/${pondId}/move/preview`, body),
  sellPreview: (pondId: number, body: SellPondRequest) =>
    api.post(`/pond/${pondId}/sell/preview`, body),
};
