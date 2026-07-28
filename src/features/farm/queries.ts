import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { createFarm, listFarms } from './service';
import { adaptFarm, type FarmModel } from './adapters';
import type { CreateFarmRequest } from './types';

export const farmKeys = {
  all: () => ['farms'] as const,
} as const;

export function useFarms() {
  const enabled = useIsAuthenticated();
  return useQuery({ queryKey: farmKeys.all(), queryFn: listFarms, enabled });
}

export function useCreateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFarmRequest) => createFarm(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: farmKeys.all() });
    },
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
