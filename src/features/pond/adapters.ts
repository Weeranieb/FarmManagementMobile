import type {
  ActivityResponse,
  PondActivityModel,
  PondCycleResponse,
  PondResponse,
} from './types';

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
  /** Live cycle-to-date P&L for the active cycle; null if no active cycle. */
  totalCost: number | null;
  totalRevenue: number | null;
  feedCost: number | null;
  netResult: number | null;
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
    totalCost: p.totalCost ?? null,
    totalRevenue: p.totalRevenue ?? null,
    feedCost: p.feedCost ?? null,
    netResult: p.netResult ?? null,
  };
}

/** UI model for one pond production cycle (from API via `adaptCycle`). */
export type PondCycleModel = {
  id: number;
  startDate: string;
  /** null while the cycle is still active. */
  endDate: string | null;
  isActive: boolean;
  totalFish: number;
  fishTypes: string[];
  totalCost: number;
  totalRevenue: number;
  /** null for legacy cycles closed before feed-cost accounting. */
  feedCost: number | null;
  netResult: number;
};

/** Maps the backend PondCycleResponse onto the UI cycle model (defensive
 *  defaults only — the P&L figures are displayed exactly as received). */
export function adaptCycle(c: PondCycleResponse): PondCycleModel {
  return {
    id: c.id,
    startDate: c.startDate,
    endDate: c.endDate ?? null,
    isActive: !!c.isActive,
    totalFish: c.totalFish ?? 0,
    fishTypes: c.fishTypes ?? [],
    totalCost: c.totalCost ?? 0,
    totalRevenue: c.totalRevenue ?? 0,
    feedCost: c.feedCost ?? null,
    netResult: c.netResult ?? 0,
  };
}

/** Maps the backend ActivityResponse onto the UI activity model. */
export function adaptActivity(a: ActivityResponse): PondActivityModel {
  return {
    id: a.id,
    mode: a.mode,
    direction: a.direction === 'in' ? 'in' : 'out',
    date: a.activityDate,
    amount: a.amount,
    fishType: a.fishType,
    pricePerUnit: a.pricePerUnit || undefined,
    total: a.total,
    totalWeightKg: a.totalWeight || undefined,
    additionalCost: a.additionalCost || undefined,
    merchant: a.merchant,
    toPondName: a.toPondName,
    fromPondName: a.fromPondName,
  };
}
