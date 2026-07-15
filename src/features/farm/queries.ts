import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { listFarms } from './service';
import { adaptFarm, type FarmModel } from './adapters';

export const farmKeys = {
  all: () => ['farms'] as const,
} as const;

export function useFarms() {
  const enabled = useIsAuthenticated();
  return useQuery({ queryKey: farmKeys.all(), queryFn: listFarms, enabled });
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
