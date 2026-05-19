import { useEffect, useState } from 'react';
import { useFarmsData } from '@/features/farm';
import { useDailyLogV6 } from './hook';
import { DailyLogView } from './view';

type Props = {
  farmId?: number;
  /** When opened from pond detail, focus this pond's row (morning pellet cell). */
  initialPondId?: number;
  onBack?: () => void;
};

export function DailyLogScreen({ farmId, initialPondId, onBack }: Props) {
  const { data: farms } = useFarmsData();
  const defaultFarmId = farmId ?? farms[0]?.id ?? null;
  const [activeFarmId, setActiveFarmId] = useState<number | null>(defaultFarmId);

  // Drill-down from pond detail passes an explicit farm — apply whenever it changes.
  useEffect(() => {
    if (farmId != null && Number.isFinite(farmId)) {
      setActiveFarmId(farmId);
    }
  }, [farmId]);

  // Home / FAB entry: seed once farms load when no route farm was provided.
  useEffect(() => {
    if (farmId != null) return;
    if (activeFarmId == null && defaultFarmId != null) setActiveFarmId(defaultFarmId);
  }, [farmId, activeFarmId, defaultFarmId]);

  const activeFarm =
    (activeFarmId != null ? farms.find((f) => f.id === activeFarmId) : undefined) ?? farms[0];
  const rawName = activeFarm?.name?.trim() ?? '';
  const farmName = rawName ? (rawName.startsWith('ฟาร์ม') ? rawName : `ฟาร์ม ${rawName}`) : 'ฟาร์ม';

  const state = useDailyLogV6(activeFarm?.id ?? null, { initialPondId });

  return (
    <DailyLogView
      state={state}
      farmName={farmName}
      farms={farms}
      activeFarmId={activeFarm?.id ?? null}
      onChangeFarm={setActiveFarmId}
      onBack={onBack}
    />
  );
}
