import { useQuery } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { getFarm, listFarms } from './service';
import { adaptFarm, type FarmModel } from './adapters';
import { mockFarms } from './__mocks__/data';

export const farmKeys = {
  all: () => ['farms'] as const,
  detail: (id: number) => ['farm', id] as const,
} as const;

export function useFarms() {
  return useQuery({ queryKey: farmKeys.all(), queryFn: listFarms });
}

export function useFarm(id: number | undefined) {
  return useQuery({
    queryKey: farmKeys.detail(id ?? 0),
    queryFn: () => getFarm(id as number),
    enabled: id != null,
  });
}

/**
 * Returns adapted UI models, falling back to mock data when offline / not
 * signed in / the API errors. Screens render the same shape either way.
 */
export function useFarmsData(): {
  data: FarmModel[];
  isLoading: boolean;
  isError: boolean;
} {
  const enabled = useIsAuthenticated();
  const q = useFarms();
  const raw = q.data;
  if (!enabled || q.isError || raw == null || !Array.isArray(raw)) {
    return { data: mockFarms, isLoading: false, isError: false };
  }
  return {
    data: raw.map(adaptFarm),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}
