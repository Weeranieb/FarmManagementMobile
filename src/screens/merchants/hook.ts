import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import i18n from '@/locale/i18n';
import {
  merchantKeys,
  useCreateMerchant,
  useDeleteMerchant,
  useMerchantsData,
  useUpdateMerchant,
  type MerchantModel,
} from '@/features/merchant';
import { apiErrorMessage, apiErrorStatus } from '@/shared/http';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import type { MerchantFormPayload } from './components/SheetMerchantForm';

/** Backend returns 409 when the contact number already exists for this client. */
const duplicateContactMsg = () => i18n.t('merchants.duplicateContact');
function saveErrorMessage(err: unknown, fallback: string): string {
  return apiErrorStatus(err) === 409 ? duplicateContactMsg() : apiErrorMessage(err, fallback);
}

export type MerchantSheetMode = 'actions' | 'add' | 'edit' | null;

export type MerchantsScreenState = {
  merchants: MerchantModel[];
  filtered: MerchantModel[];
  isAdmin: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
  sheet: MerchantSheetMode;
  activeMerchant: MerchantModel | null;
  openActions: (m: MerchantModel) => void;
  openAdd: () => void;
  openEdit: () => void;
  closeSheet: () => void;
  saving: boolean;
  handleCreate: (payload: MerchantFormPayload) => void;
  handleEdit: (payload: MerchantFormPayload) => void;
  /** Confirms via a native dialog, then soft-deletes on the backend. */
  requestDelete: () => void;
  /** Success confirmation after add/edit/delete. `key` bumps per save so the
   *  toast replays its entrance; null when hidden. */
  savedToast: { key: number; title: string; detail?: string } | null;
  dismissSavedToast: () => void;
};

export function useMerchantsScreen(): MerchantsScreenState {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  /** Managing merchants requires `userLevel >= ClientAdmin` — same gate as คลังอาหาร. */
  const isAdmin = isClientAdmin(user);

  const { data: merchants } = useMerchantsData();

  const [refreshing, setRefreshing] = useState(false);
  const { searchOpen, query, onOpenSearch, onCloseSearch, onChangeQuery } = useSearchQuery();
  const [sheet, setSheet] = useState<MerchantSheetMode>(null);
  const [activeMerchant, setActiveMerchant] = useState<MerchantModel | null>(null);
  const [savedToast, setSavedToast] =
    useState<{ key: number; title: string; detail?: string } | null>(null);
  const dismissSavedToast = useCallback(() => setSavedToast(null), []);
  const showSaved = useCallback((title: string, detail?: string) => {
    setSavedToast((p) => ({ key: (p?.key ?? 0) + 1, title, detail }));
  }, []);

  const createMutation = useCreateMerchant();
  const updateMutation = useUpdateMerchant();
  const deleteMutation = useDeleteMerchant();
  const saving =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return merchants;
    return merchants.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        m.contactNumber.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      );
    });
  }, [merchants, query]);

  const openActions = useCallback((m: MerchantModel) => {
    setActiveMerchant(m);
    setSheet('actions');
  }, []);
  const openAdd = useCallback(() => {
    setActiveMerchant(null);
    setSheet('add');
  }, []);
  const openEdit = useCallback(() => setSheet('edit'), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: merchantKeys.all() });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const handleCreate = useCallback(
    (payload: MerchantFormPayload) => {
      createMutation.mutate(
        { name: payload.name, contactNumber: payload.contactNumber, location: payload.location },
        {
          onSuccess: () => {
            closeSheet();
            showSaved(i18n.t('merchants.added'), payload.name);
          },
          onError: (err) =>
            Alert.alert(
              i18n.t('merchants.addFailed'),
              saveErrorMessage(err, i18n.t('merchants.saveFailed')),
            ),
        },
      );
    },
    [createMutation, closeSheet, showSaved],
  );

  const handleEdit = useCallback(
    (payload: MerchantFormPayload) => {
      if (!activeMerchant) return;
      updateMutation.mutate(
        {
          id: activeMerchant.id,
          name: payload.name,
          contactNumber: payload.contactNumber,
          location: payload.location,
        },
        {
          onSuccess: () => {
            closeSheet();
            showSaved(i18n.t('merchants.editSaved'), payload.name);
          },
          onError: (err) =>
            Alert.alert(
              i18n.t('merchants.editFailed'),
              saveErrorMessage(err, i18n.t('merchants.saveFailed')),
            ),
        },
      );
    },
    [activeMerchant, updateMutation, closeSheet, showSaved],
  );

  const requestDelete = useCallback(() => {
    const target = activeMerchant;
    if (!target) return;
    Alert.alert(
      i18n.t('merchants.delete'),
      i18n.t('merchants.deleteConfirm', { name: target.name }),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.delete'),
          style: 'destructive',
          onPress: () =>
            deleteMutation.mutate(target.id, {
              onSuccess: () => {
                closeSheet();
                showSaved(i18n.t('merchants.deleted'), target.name);
              },
              onError: (err) =>
                Alert.alert(
                  i18n.t('merchants.deleteFailed'),
                  apiErrorMessage(err, i18n.t('merchants.deleteFailed')),
                ),
            }),
        },
      ],
    );
  }, [activeMerchant, deleteMutation, closeSheet, showSaved]);

  return {
    merchants,
    filtered,
    isAdmin,
    refreshing,
    onRefresh,
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
    sheet,
    activeMerchant,
    openActions,
    openAdd,
    openEdit,
    closeSheet,
    saving,
    handleCreate,
    handleEdit,
    requestDelete,
    savedToast,
    dismissSavedToast,
  };
}
