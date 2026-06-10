import { http } from '@/shared/http';
import type { MerchantResponse } from './types';

export async function listMerchants(): Promise<MerchantResponse[]> {
  const payload = await http.get<unknown>('/merchant');
  return Array.isArray(payload) ? (payload as MerchantResponse[]) : [];
}
