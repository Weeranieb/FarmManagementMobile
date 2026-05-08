import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import {
  fillPond,
  getPond,
  listPonds,
  movePond,
  sellPond,
} from './service';
import type { FillPondRequest, MovePondRequest, SellPondRequest } from './types';
import { adaptPond, type PondModel } from './adapters';
import { mockPonds } from './__mocks__/data';

export const pondKeys = {
  all: () => ['ponds'] as const,
  byFarm: (farmId: number) => ['ponds', farmId] as const,
  detail: (id: number) => ['pond', id] as const,
} as const;

export function usePonds(farmId?: number) {
  return useQuery({
    queryKey: farmId == null ? pondKeys.all() : pondKeys.byFarm(farmId),
    queryFn: () => listPonds(farmId),
  });
}

export function usePond(id: number | undefined) {
  return useQuery({
    queryKey: pondKeys.detail(id ?? 0),
    queryFn: () => getPond(id as number),
    enabled: id != null,
  });
}

type DataState<T> = { data: T; isLoading: boolean; isError: boolean };

export function usePondsData(farmId?: number): DataState<PondModel[]> {
  const enabled = useIsAuthenticated();
  const q = usePonds(farmId);
  const raw = q.data;
  if (!enabled || q.isError || raw == null || !Array.isArray(raw)) {
    const list = farmId != null ? mockPonds.filter((p) => p.farmId === farmId) : mockPonds;
    return { data: list, isLoading: false, isError: false };
  }
  return {
    data: raw.map(adaptPond),
    isLoading: q.isLoading,
    isError: q.isError,
  };
}

export function usePondData(id: number | undefined): DataState<PondModel | null> {
  const enabled = useIsAuthenticated();
  const q = usePond(enabled ? id : undefined);

  if (!enabled) {
    const found = id != null ? mockPonds.find((p) => p.id === id) ?? null : null;
    return { data: found, isLoading: false, isError: false };
  }

  if (id == null) {
    return { data: null, isLoading: false, isError: false };
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
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
    },
  });
}

export function useMovePond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MovePondRequest) => movePond(pondId, body),
    onSuccess: () => {
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
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
    },
  });
}
