import { useCallback, useMemo, useState } from 'react';
import { useFarmsData } from '@/features/farm';
import { FISH_TH } from '@/utils/fmt';
import { usePondsData, type PondModel } from '@/features/pond';

export type PondFilter = 'all' | 'active' | 'maintenance';

export type PondCounts = Record<PondFilter, number>;

export function useFarmPondsScreen(farmId: number): {
  farmTitle: string;
  ponds: PondModel[];
  filteredPonds: PondModel[];
  counts: PondCounts;
  filter: PondFilter;
  onChangeFilter: (f: PondFilter) => void;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
} {
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const farm = farms.find((f) => f.id === farmId);
  const farmTitle = farm?.name ?? 'ฟาร์ม';
  const { data: pondsRaw } = usePondsData(farmId);
  const ponds = useMemo(() => (Array.isArray(pondsRaw) ? pondsRaw : []), [pondsRaw]);

  const [filter, setFilter] = useState<PondFilter>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const counts = useMemo<PondCounts>(
    () => ({
      all: ponds.length,
      active: ponds.filter((p) => p.status === 'active').length,
      maintenance: ponds.filter((p) => p.status === 'maintenance').length,
    }),
    [ponds],
  );

  /**
   * Filter and search are mutually exclusive sources of the visible list, matching the design:
   * - When searching, only the query narrows the list (across the full pond set).
   * - When not searching, only the selected filter tab narrows the list.
   */
  const filteredPonds = useMemo(() => {
    if (searchOpen) {
      const q = query.trim().toLowerCase();
      if (!q) return ponds;
      return ponds.filter((p) => {
        if (p.name.toLowerCase().includes(q)) return true;
        return p.fishTypes.some((ft) => {
          const localized = FISH_TH[ft] ?? ft;
          return ft.toLowerCase().includes(q) || localized.toLowerCase().includes(q);
        });
      });
    }
    if (filter === 'active') return ponds.filter((p) => p.status === 'active');
    if (filter === 'maintenance') return ponds.filter((p) => p.status === 'maintenance');
    return ponds;
  }, [ponds, filter, query, searchOpen]);

  const onChangeFilter = useCallback((f: PondFilter) => setFilter(f), []);
  const onOpenSearch = useCallback(() => setSearchOpen(true), []);
  const onCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery('');
  }, []);
  const onChangeQuery = useCallback((s: string) => setQuery(s), []);

  return {
    farmTitle,
    ponds,
    filteredPonds,
    counts,
    filter,
    onChangeFilter,
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
  };
}
