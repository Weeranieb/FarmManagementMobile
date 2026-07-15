import { http } from '@/shared/http';
import type {
  ActivityResponse,
  FillPondRequest,
  MovePondRequest,
  PondResponse,
  SellPondRequest,
} from './types';

export function listPonds(farmId?: number): Promise<PondResponse[]> {
  return http.get('/pond', farmId ? { farmId } : undefined);
}

export function getPond(id: number): Promise<PondResponse> {
  return http.get(`/pond/${id}`);
}

export function listPondActivities(pondId: number): Promise<ActivityResponse[]> {
  return http.get(`/pond/${pondId}/activities`);
}

export function fillPond(pondId: number, body: FillPondRequest): Promise<unknown> {
  return http.post(`/pond/${pondId}/fill`, body);
}

export function movePond(pondId: number, body: MovePondRequest): Promise<unknown> {
  return http.post(`/pond/${pondId}/move`, body);
}

export function sellPond(pondId: number, body: SellPondRequest): Promise<unknown> {
  return http.post(`/pond/${pondId}/sell`, body);
}
