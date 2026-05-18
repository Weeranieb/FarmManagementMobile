import { useEffect, useState } from 'react';
import { useFarmsData } from '@/features/farm';
import { useDailyLogV6 } from './hook';
import { DailyLogView } from './view';

type Props = {
  farmId?: number;
  onBack?: () => void;
};

export function DailyLogScreen({ farmId, onBack }: Props) {
  const { data: farms } = useFarmsData();
  const seed = farmId ?? farms[0]?.id ?? null;
  const [activeFarmId, setActiveFarmId] = useState<number | null>(seed);

  // Seed once farms arrive after first paint. Subsequent prop changes from the
  // route are intentionally ignored — the in-screen picker owns selection
  // for the rest of the session.
  useEffect(() => {
    if (activeFarmId == null && seed != null) setActiveFarmId(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const activeFarm =
    (activeFarmId != null ? farms.find((f) => f.id === activeFarmId) : undefined) ?? farms[0];
  const rawName = activeFarm?.name?.trim() ?? '';
  const farmName = rawName ? (rawName.startsWith('ฟาร์ม') ? rawName : `ฟาร์ม ${rawName}`) : 'ฟาร์ม';

  const state = useDailyLogV6(activeFarm?.id ?? null);

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
