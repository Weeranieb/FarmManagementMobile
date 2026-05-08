import type { FarmResponse } from './types';

/** UI-facing model (what screens render). DTOs from `./types` get adapted into this. */
export type FarmModel = {
  id: number;
  name: string;
  clientId: number;
  status: 'active' | 'maintenance';
  pondCount: number;
  activePonds: number;
  /** Filled by `FarmsScreen` from pond list when live `/farm` data is active. */
  totalStock: number;
  createdAt?: string;
};

export function adaptFarm(f: FarmResponse): FarmModel {
  const status: 'active' | 'maintenance' = f.status === 'maintenance' ? 'maintenance' : 'active';
  return {
    id: f.id,
    name: f.name,
    clientId: f.clientId,
    status,
    pondCount: f.pondCount ?? 0,
    activePonds: f.activePonds ?? 0,
    totalStock: 0,
    createdAt: f.createdAt,
  };
}
