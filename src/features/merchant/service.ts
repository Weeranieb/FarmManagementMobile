import { http } from '@/shared/http';
import type {
  CreateMerchantRequest,
  MerchantResponse,
  UpdateMerchantRequest,
} from './types';

export async function listMerchants(): Promise<MerchantResponse[]> {
  const payload = await http.get<unknown>('/merchant');
  return Array.isArray(payload) ? (payload as MerchantResponse[]) : [];
}

/** POST /merchant — returns the created merchant so callers can select it. */
export function createMerchant(body: CreateMerchantRequest): Promise<MerchantResponse> {
  return http.post<MerchantResponse>('/merchant', body);
}

/** PUT /merchant — id travels in the body (not the path) per the backend route. */
export function updateMerchant(body: UpdateMerchantRequest): Promise<unknown> {
  return http.put('/merchant', body);
}

/** DELETE /merchant/:id — soft-delete on the backend. */
export function deleteMerchant(id: number): Promise<unknown> {
  return http.delete(`/merchant/${id}`);
}
