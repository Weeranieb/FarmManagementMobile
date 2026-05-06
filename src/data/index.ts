// Thin abstraction over react-query hooks. Each `use*Data` returns the
// react-query state PLUS a fallback to mock data when the API request fails
// or hasn't started (e.g. offline / not signed in). This lets every screen
// stay rendered while we develop, while flipping to live data automatically
// once the backend is reachable and the user is authenticated.

import { useFarms, usePond, usePonds, useDailyLog } from '@/api/queries';
import { useAuthStore } from '@/store/auth';
import { dailyLog as mockDailyLog, farms as mockFarms, ponds as mockPonds } from '@/mock/data';
import type { DailyLogResponse, FarmResponse, PondResponse } from '@/api/types';

function useUseApi(): boolean {
  const token = useAuthStore((s) => s.token);
  return token != null;
}

function adaptFarm(f: FarmResponse) {
  const status: 'active' | 'maintenance' = f.status === 'maintenance' ? 'maintenance' : 'active';
  return {
    id: f.id,
    name: f.name,
    clientId: f.clientId,
    status,
    pondCount: f.pondCount ?? 0,
    activePonds: f.activePonds ?? 0,
    /** Filled in `FarmsScreen` from pond list when live `/farm` data is active. */
    totalStock: 0,
    createdAt: f.createdAt,
  };
}

export function useFarmsData() {
  const enabled = useUseApi();
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

function adaptPond(p: PondResponse) {
  return {
    id: p.id,
    farmId: p.farmId,
    farmName: '',
    name: p.name,
    status: (p.status === 'maintenance' ? 'maintenance' : 'active') as 'active' | 'maintenance',
    totalFish: p.totalFish ?? 0,
    fishTypes: p.fishTypes ?? [],
    ageDays: p.ageDays,
    startDate: p.startDate,
    latestActivityType: 'fill' as const,
    latestActivityDate: new Date().toISOString(),
    loggedToday: p.loggedToday ?? false,
    lateDays: p.lateDays ?? 0,
  };
}

export function usePondsData(farmId?: number) {
  const enabled = useUseApi();
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

export function usePondData(id: number | undefined) {
  const enabled = useUseApi();
  const q = usePond(enabled ? id : undefined);

  if (!enabled) {
    const found = id != null ? mockPonds.find((p) => p.id === id) : undefined;
    return {
      data: found ?? null,
      isLoading: false,
      isError: false,
    };
  }

  if (id == null) {
    return {
      data: null,
      isLoading: false,
      isError: false,
    };
  }

  if (q.isPending) {
    return {
      data: null,
      isLoading: true,
      isError: false,
    };
  }

  if (q.isError) {
    return {
      data: null,
      isLoading: false,
      isError: true,
    };
  }

  if (q.data != null) {
    return {
      data: adaptPond(q.data),
      isLoading: false,
      isError: false,
    };
  }

  return {
    data: null,
    isLoading: false,
    isError: false,
  };
}

export function useDailyLogData(pondId: number | undefined, month: string) {
  const enabled = useUseApi();
  const q = useDailyLog(enabled && pondId != null ? pondId : undefined, month);

  if (!enabled || pondId == null) {
    return {
      data: mockDailyLog as unknown as DailyLogResponse,
      isLoading: false,
      isError: false,
    };
  }

  if (q.isPending) {
    return {
      data: null,
      isLoading: true,
      isError: false,
    };
  }

  if (q.isError) {
    return {
      data: null,
      isLoading: false,
      isError: true,
    };
  }

  if (q.data != null) {
    return {
      data: q.data,
      isLoading: false,
      isError: false,
    };
  }

  return {
    data: null,
    isLoading: false,
    isError: false,
  };
}
