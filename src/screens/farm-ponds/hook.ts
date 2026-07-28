import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFarmsData } from '@/features/farm';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import { FISH_TH } from '@/utils/fmt';
import {
  pondKeys,
  useCreatePonds,
  usePondsData,
  type CreatePondItem,
  type PondModel,
} from '@/features/pond';
import { useQueryClient } from '@tanstack/react-query';
import { createMasterDataErrorMessage } from '@/components/domain/createErrors';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import i18n from '@/locale/i18n';

export type PondFilter = 'all' | 'active' | 'maintenance';

export type PondCounts = Record<PondFilter, number>;

export type FarmPondsScreenState = {
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
  /** The pond list failed to load — the view shows an error + retry rather than
   *  an empty list, which would read as "this farm has no ponds". */
  isError: boolean;
  retry: () => Promise<void>;
  /** Only a client admin may add ponds — the server enforces it, so hide the
   *  affordance instead of surfacing a 403. */
  canCreate: boolean;
  addPondsOpen: boolean;
  openAddPonds: () => void;
  closeAddPonds: () => void;
  submitAddPonds: (ponds: CreatePondItem[]) => void;
  creatingPonds: boolean;
};

export function useFarmPondsScreen(farmId: number): FarmPondsScreenState {
  const queryClient = useQueryClient();
  const { data: farmsRaw } = useFarmsData();
  const farms = Array.isArray(farmsRaw) ? farmsRaw : [];
  const farm = farms.find((f) => f.id === farmId);
  // Raw name — the view prefixes it for display via `displayFarmName`.
  const farmTitle = farm?.name ?? '';
  const { data: pondsRaw, isError } = usePondsData(farmId);
  const ponds = useMemo(() => (Array.isArray(pondsRaw) ? pondsRaw : []), [pondsRaw]);

  const [filter, setFilter] = useState<PondFilter>('all');
  const { searchOpen, query, onOpenSearch, onCloseSearch, onChangeQuery } = useSearchQuery();

  const user = useAuthStore((s) => s.user);
  const canCreate = isClientAdmin(user);
  const [addPondsOpen, setAddPondsOpen] = useState(false);
  const createPonds = useCreatePonds();

  // Gated at the open/submit paths too, not only on the button — `POST /pond`
  // is client-admin-only server-side, so the rule shouldn't live in the view.
  const openAddPonds = useCallback(() => {
    if (!canCreate) return;
    setAddPondsOpen(true);
  }, [canCreate]);
  const closeAddPonds = useCallback(() => setAddPondsOpen(false), []);

  const submitAddPonds = useCallback(
    (items: CreatePondItem[]) => {
      if (!canCreate || !Number.isFinite(farmId)) return;
      createPonds.mutate(
        { farmId, ponds: items },
        {
          onSuccess: () => setAddPondsOpen(false),
          onError: (err) => {
            const title = i18n.t('farmPonds.addFailed');
            Alert.alert(title, createMasterDataErrorMessage(err, title));
          },
        },
      );
    },
    [canCreate, farmId, createPonds],
  );

  const retry = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: pondKeys.all() });
  }, [queryClient]);

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
    isError,
    retry,
    canCreate,
    addPondsOpen,
    openAddPonds,
    closeAddPonds,
    submitAddPonds,
    creatingPonds: createPonds.isPending,
  };
}
