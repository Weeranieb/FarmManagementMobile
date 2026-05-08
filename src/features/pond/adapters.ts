import type { PondResponse } from './types';

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
  latestActivityType: 'fill' | 'move' | 'sell';
  latestActivityDate: string;
  loggedToday: boolean;
  lateDays: number;
};

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
    latestActivityType: 'fill',
    latestActivityDate: new Date().toISOString(),
    loggedToday: p.loggedToday ?? false,
    lateDays: p.lateDays ?? 0,
  };
}
