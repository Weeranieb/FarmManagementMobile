import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { farmKeys, useCreateFarm, useFarmsData, type FarmModel } from '@/features/farm';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import { useCreatePonds, type CreatePondItem } from '@/features/pond';
import { createMasterDataErrorMessage } from '@/components/domain/createErrors';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import i18n from '@/locale/i18n';

/** Farm the ponds sheet is targeting. */
export type PondsTarget = { id: number; name: string };

export type FarmsScreenState = {
  farms: FarmModel[];
  filteredFarms: FarmModel[];
  /** The farm list failed to load — the view shows an error + retry instead of
   *  an empty list, which would read as "this client has no farms". */
  isError: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
  /** Creating needs client-admin *and* a client to hang the farm off — hide the
   *  affordances rather than let a tap 403 at the server. */
  canCreate: boolean;
  createFarmOpen: boolean;
  openCreateFarm: () => void;
  closeCreateFarm: () => void;
  submitCreateFarm: (name: string) => void;
  creatingFarm: boolean;
  pondsTarget: PondsTarget | null;
  closePonds: () => void;
  submitCreatePonds: (ponds: CreatePondItem[]) => void;
  creatingPonds: boolean;
};

export function useFarmsScreen(options?: { autoOpenCreate?: boolean }): FarmsScreenState {
  const autoOpenCreate = options?.autoOpenCreate ?? false;
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { searchOpen, query, onOpenSearch, onCloseSearch, onChangeQuery } = useSearchQuery();
  // `activePonds` and `pondCount` come straight from the farm-list DTO, which is
  // refetched whenever a fill/move/sell mutation invalidates `farmKeys.all()`.
  // No per-farm `/pond` rollup needed — the list carries everything this screen shows.
  const { data: farms, isError } = useFarmsData();

  const user = useAuthStore((s) => s.user);
  const clientId = user?.clientId ?? null;
  const canCreate = isClientAdmin(user) && clientId != null;

  const [createFarmOpen, setCreateFarmOpen] = useState(false);
  const [pondsTarget, setPondsTarget] = useState<PondsTarget | null>(null);
  const createFarm = useCreateFarm();
  const createPonds = useCreatePonds();

  // Gate the open/submit paths, not just the buttons: hiding an affordance is
  // presentation, and `POST /farm` / `POST /pond` are client-admin-only for real.
  // Anything that can reach these — a deep link, a stale render, a future entry
  // point — hits the same rule the server enforces.
  const openCreateFarm = useCallback(() => {
    if (!canCreate) return;
    setCreateFarmOpen(true);
  }, [canCreate]);
  const closeCreateFarm = useCallback(() => setCreateFarmOpen(false), []);
  const closePonds = useCallback(() => setPondsTarget(null), []);

  // Home's empty hero routes here with `?newFarm=1` rather than owning a second
  // copy of the form. Fire once: the param outlives the sheet, so keying the
  // sheet off it directly would reopen it every time the user dismissed it.
  const autoOpenDone = useRef(false);
  useEffect(() => {
    if (!autoOpenCreate || autoOpenDone.current || !canCreate) return;
    autoOpenDone.current = true;
    setCreateFarmOpen(true);
  }, [autoOpenCreate, canCreate]);

  const submitCreateFarm = useCallback(
    (name: string) => {
      if (!canCreate || clientId == null) return;
      createFarm.mutate(
        { clientId, name },
        {
          onSuccess: (farm) => {
            setCreateFarmOpen(false);
            // A farm with no ponds does nothing, and the user is already in the
            // "setting up" mindset — chain into adding ponds instead of dropping
            // them back on an empty farm card.
            setPondsTarget({ id: farm.id, name: farm.name || name });
          },
          onError: (err) => {
            const title = i18n.t('farms.createFailed');
            Alert.alert(title, createMasterDataErrorMessage(err, title));
          },
        },
      );
    },
    [canCreate, clientId, createFarm],
  );

  const submitCreatePonds = useCallback(
    (ponds: CreatePondItem[]) => {
      const target = pondsTarget;
      if (!canCreate || target == null) return;
      createPonds.mutate(
        { farmId: target.id, ponds },
        {
          onSuccess: () => setPondsTarget(null),
          onError: (err) => {
            const title = i18n.t('farmPonds.addFailed');
            Alert.alert(title, createMasterDataErrorMessage(err, title));
          },
        },
      );
    },
    [canCreate, pondsTarget, createPonds],
  );

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
    isError,
    refreshing,
    onRefresh,
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
    canCreate,
    createFarmOpen,
    openCreateFarm,
    closeCreateFarm,
    submitCreateFarm,
    creatingFarm: createFarm.isPending,
    pondsTarget,
    closePonds,
    submitCreatePonds,
    creatingPonds: createPonds.isPending,
  };
}
