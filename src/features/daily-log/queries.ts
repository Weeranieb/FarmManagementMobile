import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/features/auth';
import { getDailyLogMonth, upsertDailyLogMonth } from './service';
import type { DailyLogResponse, DailyLogUpsertRequest } from './types';
import { mockDailyLog } from './__mocks__/data';

export const dailyLogKeys = {
  month: (pondId: number, month: string) => ['dailyLog', pondId, month] as const,
} as const;

export function useDailyLog(pondId: number | undefined, month: string) {
  return useQuery({
    queryKey: dailyLogKeys.month(pondId ?? 0, month),
    queryFn: () => getDailyLogMonth(pondId as number, month),
    enabled: pondId != null,
  });
}

type DataState<T> = { data: T; isLoading: boolean; isError: boolean };

export function useDailyLogData(
  pondId: number | undefined,
  month: string,
): DataState<DailyLogResponse | null> {
  const enabled = useIsAuthenticated();
  const q = useDailyLog(enabled && pondId != null ? pondId : undefined, month);

  if (!enabled || pondId == null) {
    return { data: mockDailyLog, isLoading: false, isError: false };
  }

  if (q.isPending) {
    return { data: null, isLoading: true, isError: false };
  }

  if (q.isError) {
    return { data: null, isLoading: false, isError: true };
  }

  if (q.data != null) {
    return { data: q.data, isLoading: false, isError: false };
  }

  return { data: null, isLoading: false, isError: false };
}

export function useUpsertDailyLog(pondId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DailyLogUpsertRequest) => upsertDailyLogMonth(pondId, body),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: dailyLogKeys.month(pondId, vars.month) });
    },
  });
}
