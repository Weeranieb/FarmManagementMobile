import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { farmKeys } from '@/features/farm';
import {
  createPonds,
  fillPond,
  getPond,
  listPondActivities,
  listPondCycles,
  listPonds,
  movePond,
  sellPond,
} from './service';
import type {
  CreatePondsRequest,
  FillPondRequest,
  MovePondRequest,
  PondActivityModel,
  SellPondRequest,
} from './types';
import { adaptActivity, adaptCycle, adaptPond, type PondCycleModel, type PondModel } from './adapters';

export const pondKeys = {
  all: () => ['ponds'] as const,
  byFarm: (farmId: number) => ['ponds', farmId] as const,
  detail: (id: number) => ['pond', id] as const,
  activities: (pondId: number) => ['pond', pondId, 'activities'] as const,
  cycles: (pondId: number) => ['pond', pondId, 'cycles'] as const,
} as const;

export function usePonds(farmId?: number, options?: { enabled?: boolean }) {
  const isAuth = useIsAuthenticated();
  // Callers that scope by farm (Daily Log) can pass `enabled: false` while the
  // farm is still resolving — otherwise a `farmId == null` render fires the
  // unscoped `GET /pond` (no farmId), which the backend rejects AND which lands
  // under the `['ponds']` key that no warm screen ever populated. The tablet's
  // PondMaster intentionally calls `usePonds()` with no farm to list every
  // pond, so the gate is opt-in (defaults to enabled).
  const enabled = isAuth && (options?.enabled ?? true);
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

export function usePondCycles(pondId: number | undefined) {
  const enabled = useIsAuthenticated();
  return useQuery({
    queryKey: pondKeys.cycles(pondId ?? 0),
    queryFn: () => listPondCycles(pondId as number),
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

/** Shared shaping for a `useQuery<TRaw[]>` result into a `DataState<TModel[]>` —
 *  used by every pond list query (activities, cycles) so the auth/pending/error
 *  branches can't drift between them. */
function useListDataState<TRaw, TModel>(
  enabled: boolean,
  id: number | undefined,
  query: { isPending: boolean; isError: boolean; data: TRaw[] | undefined },
  adapter: (raw: TRaw) => TModel,
): DataState<TModel[]> {
  if (!enabled || id == null) {
    return { data: [], isLoading: false, isError: !enabled };
  }

  if (query.isPending) {
    return { data: [], isLoading: true, isError: false };
  }

  if (query.isError || !Array.isArray(query.data)) {
    return { data: [], isLoading: false, isError: true };
  }

  return {
    data: query.data.map(adapter),
    isLoading: false,
    isError: false,
  };
}

export function usePondActivitiesData(pondId: number | undefined): DataState<PondActivityModel[]> {
  const enabled = useIsAuthenticated();
  const q = usePondActivities(enabled ? pondId : undefined);
  return useListDataState(enabled, pondId, q, adaptActivity);
}

export function usePondCyclesData(pondId: number | undefined): DataState<PondCycleModel[]> {
  const enabled = useIsAuthenticated();
  const q = usePondCycles(enabled ? pondId : undefined);
  return useListDataState(enabled, pondId, q, adaptCycle);
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

export function useCreatePonds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePondsRequest) => createPonds(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
      // New ponds change the farm's `pondCount`, which the farms list renders
      // straight from the farm DTO.
      void qc.invalidateQueries({ queryKey: farmKeys.all() });
    },
  });
}

export function useFillPond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FillPondRequest) => fillPond(pondId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pondKeys.detail(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.activities(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.cycles(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
      // Fill can transition a maintenance pond back to active, which changes
      // farm.activePonds — invalidate the farms cache so dashboard counts
      // refresh in lockstep.
      void qc.invalidateQueries({ queryKey: farmKeys.all() });
    },
  });
}

export function useMovePond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MovePondRequest) => movePond(pondId, body),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: pondKeys.activities(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.activities(variables.toPondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.detail(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.detail(variables.toPondId) });
      // markToClose closes the source cycle and opens/extends the destination
      // one — both cycle lists must refresh.
      void qc.invalidateQueries({ queryKey: pondKeys.cycles(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.cycles(variables.toPondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
      // markToClose can flip the source pond to maintenance — farm counts go
      // stale; same with destination if it was previously empty/maintenance.
      void qc.invalidateQueries({ queryKey: farmKeys.all() });
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
      void qc.invalidateQueries({ queryKey: pondKeys.cycles(pondId) });
      void qc.invalidateQueries({ queryKey: pondKeys.all() });
      // markToClose can transition the pond to maintenance — farm counts go
      // stale; refresh the farms cache so dashboards see the new totals.
      void qc.invalidateQueries({ queryKey: farmKeys.all() });
    },
  });
}
