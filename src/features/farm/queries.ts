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
  const q = useFarms();
  const raw = q.data;
  const data = Array.isArray(raw) ? raw.map(adaptFarm) : [];
  return {
    data,
    isLoading: q.isLoading,
    isError: q.isError,
  };
}
