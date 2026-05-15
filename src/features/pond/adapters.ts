import type { ActivityMock } from './__mocks__/data';
import type { ActivityResponse, PondResponse } from './types';

/** UI-facing model rendered by every pond screen / card. */
export type PondModel = {
  id: number;
  farmId: number;
  farmName: string;
  name: string;
  status: 'active' | 'maintenance';
  totalFish: number;
  fishTypes: string[];
  ageDays: number | null;
  startDate: string | null;
  /** null when the pond has no activity yet (e.g. brand-new pond). */
  latestActivityType: 'fill' | 'move' | 'sell' | null;
  /** null when the pond has no activity yet. */
  latestActivityDate: string | null;
  loggedToday: boolean;
  lateDays: number;
};

function normalizeActivityType(
  raw: PondResponse['latestActivityType'],
): PondModel['latestActivityType'] {
  if (raw === 'fill' || raw === 'move' || raw === 'sell') return raw;
  return null;
}

export function adaptPond(p: PondResponse): PondModel {
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
    latestActivityType: normalizeActivityType(p.latestActivityType),
    latestActivityDate: p.latestActivityDate ?? null,
    loggedToday: p.loggedToday ?? false,
    lateDays: p.lateDays ?? 0,
  };
}

/**
 * Maps the backend ActivityResponse onto the UI's ActivityMock shape so
 * HistoryBody can render API rows through the same code path as mocks.
 */
export function adaptActivity(a: ActivityResponse): ActivityMock {
  return {
    id: a.id,
    mode: a.mode,
    date: a.activityDate,
    amount: a.amount,
    fishType: a.fishType,
    pricePerUnit: a.pricePerUnit || undefined,
    total: a.total,
    merchant: a.merchant,
  };
}
