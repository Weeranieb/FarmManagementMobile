import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { fillPond, getPond, listPondActivities, listPonds, movePond, sellPond } from './service';
import type { FillPondRequest, MovePondRequest, SellPondRequest } from './types';
import { adaptActivity, adaptPond, type PondModel } from './adapters';
import type { PondActivityModel } from './types';

export const pondKeys = {
  all: () => ['ponds'] as const,
  byFarm: (farmId: number) => ['ponds', farmId] as const,
  detail: (id: number) => ['pond', id] as const,
  activities: (pondId: number) => ['pond', pondId, 'activities'] as const,
} as const;

export function usePonds(farmId?: number) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: farmId == null ? pondKeys.all() : pondKeys.byFarm(farmId),
    queryFn: () => listPonds(farmId),
    enabled,
  });
}

export function usePond(id: number | undefined) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: pondKeys.detail(id ?? 0),
    queryFn: () => getPond(id as number),
    enabled: enabled && id != null,
  });
}

export function usePondActivities(pondId: number | undefined) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: pondKeys.activities(pondId ?? 0),
    queryFn: () => listPondActivities(pondId as number),
    enabled: enabled && pondId != null,
  });
}

type DataState<T> = { data: T; isLoading: boolean; isError: boolean };

export function usePondsData(farmId?: number): DataState<PondModel[]> {
  const enabled = useIsAuthenticated();
  const q = usePonds(farmId);
  const raw = q.data;
  if (!enabled || q.isError || raw == null || !Array.isArray(raw)) {
    return { data: [], isLoading: enabled && q.isLoading, isError: !enabled || q.isError };
  }
  return {
    data: raw.map(adaptPond),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}

export function usePondActivitiesData(pondId: number | undefined): DataState<PondActivityModel[]> {
  const enabled = useIsAuthenticated();
  const q = usePondActivities(enabled ? pondId : undefined);

  if (!enabled || pondId == null) {
    return { data: [], isLoading: false, isError: !enabled };
  }

  if (q.isPending) {
    return { data: [], isLoading: true, isError: false };
  }

  if (q.isError || !Array.isArray(q.data)) {
    return { data: [], isLoading: false, isError: true };
  }

  return {
    data: q.data.map(adaptActivity),
    isLoading: false,
    isError: false,
  };
}

export function usePondData(id: number | undefined): DataState<PondModel | null> {
  const enabled = useIsAuthenticated();
  const q = usePond(enabled ? id : undefined);

  if (!enabled || id == null) {
    return { data: null, isLoading: false, isError: !enabled };
  }

  if (q.isPending) {
    return { data: null, isLoading: true, isError: false };
  }

  if (q.isError) {
    return { data: null, isLoading: false, isError: true };
  }

  if (q.data != null) {
    return { data: adaptPond(q.data), isLoading: false, isError: false };
  }

  return { data: null, isLoading: false, isError: false };
}

export function useFillPond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FillPondRequest) => fillPond(pondId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pondKeys.detail(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.activities(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
    },
  });
}

export function useMovePond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MovePondRequest) => movePond(pondId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pondKeys.activities(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
    },
  });
}

export function useSellPond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SellPondRequest) => sellPond(pondId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pondKeys.detail(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.activities(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
    },
  });
}
