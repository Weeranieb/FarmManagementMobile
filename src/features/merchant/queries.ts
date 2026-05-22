import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { listMerchants } from './service';
import { adaptMerchant } from './adapters';
import type { MerchantModel } from './types';

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
