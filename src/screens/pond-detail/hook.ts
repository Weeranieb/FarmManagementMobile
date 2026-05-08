import { useState } from 'react';
import { Alert } from 'react-native';
import { useFarmsData } from '@/features/farm';
import { usePondData, type PondModel } from '@/features/pond';

export type PondDetailTab = 'feed' | 'history';

export function usePondDetailScreen(pondId: number) {
  const [tab, setTab] = useState<PondDetailTab>('feed');
  const {
    data: pond,
    isLoading,
    isError,
  } = usePondData(Number.isFinite(pondId) ? pondId : undefined);
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const farmSubtitle =
    pond?.farmName?.trim() ||
    (pond ? farms.find((f) => f.id === pond.farmId)?.name : undefined) ||
    '';

  const onPondOverflow = () => {
    Alert.alert('เมนู', 'ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้');
  };

  return {
    pond: pond as PondModel | null,
    isLoading,
    isError,
    farmSubtitle,
    tab,
    setTab,
    onPondOverflow,
  };
}
