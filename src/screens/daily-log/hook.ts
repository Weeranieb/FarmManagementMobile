import { useFarmsData } from '@/features/farm';
import { usePondData } from '@/features/pond';

export function useDailyLogScreen(pondId: number): {
  title: string;
  subtitle: string;
} {
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const { data: pond } = usePondData(Number.isFinite(pondId) ? pondId : undefined);

  const subtitle =
    pond?.farmName?.trim() ||
    (pond ? farms.find((f) => f.id === pond.farmId)?.name : undefined) ||
    '';

  return {
    title: pond?.name ?? 'บันทึกอาหาร',
    subtitle,
  };
}
