// React-query hooks. Keep query keys centralized so invalidation is safe.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { farmsApi } from './farms';
import {
  pondsApi,
  type FillPondRequest,
  type MovePondRequest,
  type SellPondRequest,
} from './ponds';
import { dailyLogApi, type DailyLogUpsertRequest } from './dailyLog';

export const qk = {
  farms: () => ['farms'] as const,
  farm: (id: number) => ['farm', id] as const,
  ponds: (farmId?: number) =>
    farmId == null ? (['ponds'] as const) : (['ponds', farmId] as const),
  pond: (id: number) => ['pond', id] as const,
  dailyLog: (pondId: number, month: string) => ['dailyLog', pondId, month] as const,
} as const;

export function useFarms() {
  return useQuery({ queryKey: qk.farms(), queryFn: farmsApi.list });
}

export function useFarm(id: number | undefined) {
  return useQuery({
    queryKey: qk.farm(id ?? 0),
    queryFn: () => farmsApi.get(id as number),
    enabled: id != null,
  });
}

export function usePonds(farmId?: number) {
  return useQuery({ queryKey: qk.ponds(farmId), queryFn: () => pondsApi.list(farmId) });
}

export function usePond(id: number | undefined) {
  return useQuery({
    queryKey: qk.pond(id ?? 0),
    queryFn: () => pondsApi.get(id as number),
    enabled: id != null,
  });
}

export function useDailyLog(pondId: number | undefined, month: string) {
  return useQuery({
    queryKey: qk.dailyLog(pondId ?? 0, month),
    queryFn: () => dailyLogApi.getMonth(pondId as number, month),
    enabled: pondId != null,
  });
}

export function useFillPond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FillPondRequest) => pondsApi.fill(pondId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.pond(pondId) });
      void qc.invalidateQueries({ queryKey: qk.ponds() });
    },
  });
}

export function useMovePond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MovePondRequest) => pondsApi.move(pondId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.ponds() });
    },
  });
}

export function useSellPond(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SellPondRequest) => pondsApi.sell(pondId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.pond(pondId) });
      void qc.invalidateQueries({ queryKey: qk.ponds() });
    },
  });
}

export function useUpsertDailyLog(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DailyLogUpsertRequest) => dailyLogApi.upsertMonth(pondId, body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: qk.dailyLog(pondId, vars.month) });
    },
  });
}
