import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { createMerchant, deleteMerchant, listMerchants, updateMerchant } from './service';
import { adaptMerchant } from './adapters';
import type { CreateMerchantRequest, MerchantModel, UpdateMerchantRequest } from './types';

export const merchantKeys = {
  all: () => ['merchants'] as const,
} as const;

export function useMerchants() {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: merchantKeys.all(),
    queryFn: listMerchants,
    enabled,
  });
}

/**
 * Returns adapted merchants for picker UIs. The merchant catalogue is small
 * and shared across the org — a single GET /merchant call backs every sell
 * flow surface, so callers can use this hook freely without worrying about
 * fan-out.
 */
export function useMerchantsData(): {
  data: MerchantModel[];
  isLoading: boolean;
  isError: boolean;
} {
  const enabled = useIsAuthenticated();
  const q = useMerchants();
  if (!enabled || q.isError || q.data == null || !Array.isArray(q.data)) {
    return { data: [], isLoading: enabled && q.isLoading, isError: !enabled || q.isError };
  }
  return {
    data: q.data.map(adaptMerchant),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}

/**
 * Create/update/delete all invalidate the single `['merchants']` list so every
 * consumer — the management screen and the sell-flow picker — refreshes at
 * once. `createMerchant` resolves to the adapted new merchant so the sell flow
 * can auto-select it after an inline add.
 */
export function useCreateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMerchantRequest) => createMerchant(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: merchantKeys.all() }),
  });
}

export function useUpdateMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMerchantRequest) => updateMerchant(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: merchantKeys.all() }),
  });
}

export function useDeleteMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMerchant(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: merchantKeys.all() }),
  });
}
