import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { getFarm, listFarms } from './service';
import { adaptFarm, type FarmModel } from './adapters';

export const farmKeys = {
  all: () => ['farms'] as const,
  detail: (id: number) => ['farm', id] as const,
} as const;

export function useFarms() {
  const enabled = useIsAuthenticated();
  return useQuery({ queryKey: farmKeys.all(), queryFn: listFarms, enabled });
}

export function useFarm(id: number | undefined) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: farmKeys.detail(id ?? 0),
    queryFn: () => getFarm(id as number),
    enabled: enabled && id != null,
  });
}

export function useFarmsData(): {
  data: FarmModel[];
  isLoading: boolean;
  isError: boolean;
} {
  const enabled = useIsAuthenticated();
  const q = useFarms();
  const raw = q.data;
  if (!enabled || q.isError || raw == null || !Array.isArray(raw)) {
    return { data: [], isLoading: enabled && q.isLoading, isError: !enabled || q.isError };
  }
  return {
    data: raw.map(adaptFarm),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}
