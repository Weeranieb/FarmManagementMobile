import { http } from '@/shared/http';
import type { DropdownItem } from './types';

export async function listFishSizeGrades(): Promise<DropdownItem[]> {
  const payload = await http.get<unknown>('/fish-size-grade/dropdown');
  return Array.isArray(payload) ? (payload as DropdownItem[]) : [];
}
