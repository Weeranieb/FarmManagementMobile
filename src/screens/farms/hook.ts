import { useCallback, useMemo, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import {
  farmKeys,
  useFarms,
  useFarmsData,
  type FarmModel,
  type FarmResponse,
} from '@/features/farm';
import { listPonds, pondKeys } from '@/features/pond';

export function useFarmsScreen(): {
  farms: FarmModel[];
  filteredFarms: FarmModel[];
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
} {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { data: farmsRaw } = useFarmsData();
  const farmsQuery = useFarms();
  const hasToken = useAuthStore((s) => s.token != null);
  /** Only merge `/pond` rollups when the farm list loaded successfully from the API. */
  const useLivePondRollup = hasToken && farmsQuery.isSuccess && Array.isArray(farmsQuery.data);

  const baseline = Array.isArray(farmsRaw) ? farmsRaw : [];

  const pondQueries = useQueries({
    queries: useLivePondRollup
      ? baseline.map((f) => ({
          queryKey: pondKeys.byFarm(f.id),
          queryFn: () => listPonds(f.id),
          enabled: useLivePondRollup,
          staleTime: 60_000,
        }))
      : [],
  });

  const farms = useMemo(() => {
    if (!useLivePondRollup) return baseline;

    return baseline.map((f, idx) => {
      const ponds = pondQueries[idx]?.data;
      if (!Array.isArray(ponds)) return f;

      let totalStock = 0;
      let activeFromPonds = 0;
      for (const p of ponds) {
        if (p.status === 'active') activeFromPonds++;
        totalStock += p.totalFish ?? 0;
      }

      return { ...f, activePonds: activeFromPonds, totalStock };
    });
  }, [baseline, pondQueries, useLivePondRollup]);

  const filteredFarms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return farms;
    return farms.filter((f) => f.name.toLowerCase().includes(q));
  }, [farms, query]);

  const onOpenSearch = useCallback(() => setSearchOpen(true), []);
  const onCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery('');
  }, []);
  const onChangeQuery = useCallback((s: string) => setQuery(s), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: farmKeys.all() });
      const farmsList = queryClient.getQueryData<FarmResponse[]>(farmKeys.all());
      if (Array.isArray(farmsList) && farmsList.length > 0) {
        await Promise.all(
          farmsList.map((f) => queryClient.refetchQueries({ queryKey: pondKeys.byFarm(f.id) })),
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return {
    farms,
    filteredFarms,
    refreshing,
    onRefresh,
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
  };
}
