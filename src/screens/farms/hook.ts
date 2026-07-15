import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { farmKeys, useFarmsData, type FarmModel } from '@/features/farm';
import { useSearchQuery } from '@/hooks/useSearchQuery';

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
  const { searchOpen, query, onOpenSearch, onCloseSearch, onChangeQuery } = useSearchQuery();
  // `activePonds` and `pondCount` come straight from the farm-list DTO, which is
  // refetched whenever a fill/move/sell mutation invalidates `farmKeys.all()`.
  // No per-farm `/pond` rollup needed — the list carries everything this screen shows.
  const { data: farms } = useFarmsData();

  const filteredFarms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return farms;
    return farms.filter((f) => f.name.toLowerCase().includes(q));
  }, [farms, query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: farmKeys.all() });
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
