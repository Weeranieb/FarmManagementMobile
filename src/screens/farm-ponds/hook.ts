import { useCallback, useMemo, useState } from 'react';
import { useFarmsData } from '@/features/farm';
import { usePondsData, type PondModel } from '@/features/pond';

export function useFarmPondsScreen(farmId: number): {
  farmTitle: string;
  ponds: PondModel[];
  filteredPonds: PondModel[];
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

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredPonds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ponds;
    return ponds.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      return p.fishTypes.some((ft) => ft.toLowerCase().includes(q));
    });
  }, [ponds, query]);

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
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
  };
}
