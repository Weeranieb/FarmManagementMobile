import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useFarmsData } from '@/features/farm';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import {
  useDeletePond,
  usePondActivitiesData,
  usePondData,
  useUpdatePond,
  type PondModel,
} from '@/features/pond';
import { createMasterDataErrorMessage } from '@/components/domain/createErrors';
import { apiErrorMessage } from '@/shared/http';
import { displayPondName } from '@/utils/fmt';
import i18n from '@/locale/i18n';

export type PondDetailTab = 'feed' | 'history' | 'cycles';

/**
 * @param focusTab Tab to jump to, set by a flow that just wrote something the
 *   user should land on (see the sell route). The caller clears it right after,
 *   so it never fights a manual tab change.
 */
export function usePondDetailScreen(
  pondId: number,
  focusTab?: PondDetailTab | null,
  onDeleted?: () => void,
) {
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

  // Managing a pond is master data — same client-admin rule as creating one.
  const canManage = isClientAdmin(useAuthStore((s) => s.user));
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const updatePond = useUpdatePond(pondId);
  const deletePond = useDeletePond();
  // Delete is blocked once a pond has history — the server would orphan those
  // activities behind a soft-deleted row (see SheetPondActions).
  const { data: activities } = usePondActivitiesData(
    Number.isFinite(pondId) ? pondId : undefined,
  );

  const onPondOverflow = useCallback(() => {
    if (!canManage) return;
    setActionsOpen(true);
  }, [canManage]);

  const closeActions = useCallback(() => setActionsOpen(false), []);
  const openEdit = useCallback(() => {
    setActionsOpen(false);
    setEditOpen(true);
  }, []);
  const closeEdit = useCallback(() => setEditOpen(false), []);

  const submitEdit = useCallback(
    (payload: { name: string; area?: number }) => {
      if (!canManage) return;
      updatePond.mutate(payload, {
        onSuccess: () => setEditOpen(false),
        onError: (err) => {
          const title = i18n.t('pondDetail.actions.updateFailed');
          Alert.alert(title, createMasterDataErrorMessage(err, title));
        },
      });
    },
    [canManage, updatePond],
  );

  const toggleStatus = useCallback(() => {
    if (!canManage || pond == null) return;
    const next = pond.status === 'maintenance' ? 'active' : 'maintenance';
    const apply = () =>
      updatePond.mutate(
        { status: next },
        {
          onSuccess: () => setActionsOpen(false),
          onError: (err) => {
            const title = i18n.t('pondDetail.actions.updateFailed');
            Alert.alert(title, createMasterDataErrorMessage(err, title));
          },
        },
      );
    // Closing drops the pond out of the daily log, so confirm it; reopening is
    // additive and needs no ceremony.
    if (next === 'maintenance') {
      Alert.alert(
        i18n.t('pondDetail.actions.closeConfirmTitle', { pond: displayPondName(pond.name) }),
        i18n.t('pondDetail.actions.closeConfirmBody'),
        [
          { text: i18n.t('common.cancel'), style: 'cancel' },
          { text: i18n.t('pondDetail.actions.close'), style: 'destructive', onPress: apply },
        ],
      );
      return;
    }
    apply();
  }, [canManage, pond, updatePond]);

  const requestDelete = useCallback(() => {
    if (!canManage || pond == null) return;
    Alert.alert(
      i18n.t('pondDetail.actions.deleteConfirmTitle', { pond: displayPondName(pond.name) }),
      i18n.t('pondDetail.actions.deleteConfirmBody'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('pondDetail.actions.delete'),
          style: 'destructive',
          onPress: () =>
            deletePond.mutate(pond.id, {
              onSuccess: () => {
                setActionsOpen(false);
                // The screen it was showing no longer exists — hand control back
                // to the caller (the route pops to the farm).
                onDeleted?.();
              },
              onError: (err) => {
                const title = i18n.t('pondDetail.actions.deleteFailed');
                Alert.alert(title, apiErrorMessage(err, title));
              },
            }),
        },
      ],
    );
  }, [canManage, pond, deletePond, onDeleted]);

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
    canManage,
    actionsOpen,
    closeActions,
    editOpen,
    openEdit,
    closeEdit,
    submitEdit,
    toggleStatus,
    requestDelete,
    hasHistory: activities.length > 0,
    saving: updatePond.isPending || deletePond.isPending,
    refresh,
    refreshing,
  };
}
