import { useEffect, useState } from 'react';
import { useFarmsData } from '@/features/farm';
import { displayFarmName } from '@/utils/fmt';
import { useDailyLogV6 } from './hook';
import { DailyLogView } from './view';

type Props = {
  farmId?: number;
  /** When opened from pond detail, focus this pond's row (morning pellet cell). */
  initialPondId?: number;
  onBack?: () => void;
  /** Bottom safe-area inset to keep the floating SaveBar clear of the home
   *  indicator. Passed by the mobile stack route; tablet leaves it at 0 since
   *  its pane already sits inside a bottom-edge SafeAreaView. */
  bottomInset?: number;
};

export function DailyLogScreen({ farmId, initialPondId, onBack, bottomInset }: Props) {
  const { data: farms, isLoading: farmsLoading } = useFarmsData();
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
  const farmName = displayFarmName(activeFarm?.name);

  const state = useDailyLogV6(activeFarm?.id ?? null, { initialPondId, farmsLoading });

  return (
    <DailyLogView
      state={state}
      farmName={farmName}
      farms={farms}
      activeFarmId={activeFarm?.id ?? null}
      onChangeFarm={setActiveFarmId}
      onBack={onBack}
      bottomInset={bottomInset}
    />
  );
}
