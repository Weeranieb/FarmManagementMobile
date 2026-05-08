import { useFarmsData } from '@/features/farm';
import { usePondsData, type PondModel } from '@/features/pond';

export function useFarmPondsScreen(farmId: number): {
  farmTitle: string;
  ponds: PondModel[];
} {
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const farm = farms.find((f) => f.id === farmId);
  const farmTitle = farm?.name ?? 'ฟาร์ม';
  const { data: pondsRaw } = usePondsData(farmId);
  const ponds = Array.isArray(pondsRaw) ? pondsRaw : [];
  return { farmTitle, ponds };
}
