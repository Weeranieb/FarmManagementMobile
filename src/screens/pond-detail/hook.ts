import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useFarmsData } from '@/features/farm';
import { usePondData, type PondModel } from '@/features/pond';

export type PondDetailTab = 'feed' | 'history' | 'cycles';

/**
 * @param focusTab Tab to jump to, set by a flow that just wrote something the
 *   user should land on (see the sell route). The caller clears it right after,
 *   so it never fights a manual tab change.
 */
export function usePondDetailScreen(pondId: number, focusTab?: PondDetailTab | null) {
  const [tab, setTab] = useState<PondDetailTab>('feed');

  useEffect(() => {
    if (focusTab) setTab(focusTab);
  }, [focusTab]);

  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
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

  // Pull-to-refresh: invalidating ['pond', pondId] prefix-matches both the
  // detail query and ['pond', pondId, 'activities'] (history tab); ['dailyLog']
  // covers the daily-feed tab's monthly queries.
  const refresh = useCallback(async () => {
    if (!Number.isFinite(pondId)) return;
    setRefreshing(true);
    try {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pond', pondId] }),
        qc.invalidateQueries({ queryKey: ['dailyLog'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [qc, pondId]);

  return {
    pond: pond as PondModel | null,
    isLoading,
    isError,
    farmSubtitle,
    tab,
    setTab,
    onPondOverflow,
    refresh,
    refreshing,
  };
}
