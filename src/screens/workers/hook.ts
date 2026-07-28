import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { isClientAdmin, useAuthStore } from '@/features/auth';
import type { UserResponse } from '@/features/auth';
import {
  useCreateWorker,
  useDeleteWorker,
  useResetWorkerPassword,
  useUpdateWorker,
  useWorkersData,
  userKeys,
} from '@/features/user';
import { apiErrorMessage, apiErrorStatus } from '@/shared/http';
import i18n from '@/locale/i18n';
import { useSearchQuery } from '@/hooks/useSearchQuery';
import type { WorkerFormPayload } from './components/SheetWorkerForm';

/** The backend returns 409 when the username is already taken — anywhere, not
 *  just in this client, since usernames are the global login identifier. */
function saveErrorMessage(err: unknown, fallback: string): string {
  return apiErrorStatus(err) === 409
    ? i18n.t('workers.err.usernameTaken')
    : apiErrorMessage(err, fallback);
}

export type WorkerSheetMode = 'actions' | 'add' | 'edit' | 'reset' | null;

export type WorkersScreenState = {
  workers: UserResponse[];
  filtered: UserResponse[];
  isAdmin: boolean;
  isLoading: boolean;
  isError: boolean;
  myId: number | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  searchOpen: boolean;
  query: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeQuery: (s: string) => void;
  sheet: WorkerSheetMode;
  activeWorker: UserResponse | null;
  openActions: (w: UserResponse) => void;
  openAdd: () => void;
  openEdit: () => void;
  openReset: () => void;
  closeSheet: () => void;
  saving: boolean;
  handleCreate: (payload: WorkerFormPayload) => void;
  handleEdit: (payload: WorkerFormPayload) => void;
  handleResetPassword: (password: string) => void;
  requestRemove: () => void;
};

export function useWorkersScreen(): WorkersScreenState {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);
  /** Every action on this screen is a client-admin operation server-side, so the
   *  screen gates on the same predicate as จัดการ's other tools. */
  const isAdmin = isClientAdmin(me);
  const myId = me?.id ?? null;

  const { data: workers, isLoading, isError } = useWorkersData();

  const [refreshing, setRefreshing] = useState(false);
  const { searchOpen, query, onOpenSearch, onCloseSearch, onChangeQuery } = useSearchQuery();
  const [sheet, setSheet] = useState<WorkerSheetMode>(null);
  const [activeWorker, setActiveWorker] = useState<UserResponse | null>(null);

  const createMutation = useCreateWorker();
  const updateMutation = useUpdateWorker(activeWorker?.id ?? 0);
  const resetMutation = useResetWorkerPassword(activeWorker?.id ?? 0);
  const deleteMutation = useDeleteWorker();
  const saving =
    createMutation.isPending ||
    updateMutation.isPending ||
    resetMutation.isPending ||
    deleteMutation.isPending;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter((w) => {
      const name = `${w.firstName} ${w.lastName ?? ''}`.toLowerCase();
      return (
        name.includes(q) ||
        w.username.toLowerCase().includes(q) ||
        (w.contactNumber ?? '').includes(q)
      );
    });
  }, [workers, query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: userKeys.all() });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const closeSheet = useCallback(() => setSheet(null), []);
  const openActions = useCallback((w: UserResponse) => {
    setActiveWorker(w);
    setSheet('actions');
  }, []);
  const openAdd = useCallback(() => {
    if (!isAdmin) return;
    setActiveWorker(null);
    setSheet('add');
  }, [isAdmin]);
  const openEdit = useCallback(() => setSheet('edit'), []);
  const openReset = useCallback(() => setSheet('reset'), []);

  const handleCreate = useCallback(
    (payload: WorkerFormPayload) => {
      if (!isAdmin || !payload.password) return;
      createMutation.mutate(
        {
          username: payload.username,
          password: payload.password,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          contactNumber: payload.contactNumber,
          userLevel: payload.userLevel,
        },
        {
          onSuccess: () => {
            closeSheet();
            // The password is not recoverable afterwards — the owner has to hand
            // it over now, so say so instead of a bare "saved".
            Alert.alert(
              i18n.t('workers.created.title'),
              i18n.t('workers.created.body', {
                name: payload.firstName,
                username: payload.username,
              }),
            );
          },
          onError: (err) =>
            Alert.alert(
              i18n.t('workers.err.saveTitle'),
              saveErrorMessage(err, i18n.t('workers.err.saveTitle')),
            ),
        },
      );
    },
    [closeSheet, createMutation, isAdmin],
  );

  const handleEdit = useCallback(
    (payload: WorkerFormPayload) => {
      if (!isAdmin || !activeWorker) return;
      updateMutation.mutate(
        {
          username: payload.username,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          contactNumber: payload.contactNumber,
          // Never send a role for your own row: the server would accept the
          // demotion and take this screen away mid-session.
          ...(activeWorker.id === myId ? {} : { userLevel: payload.userLevel }),
        },
        {
          onSuccess: closeSheet,
          onError: (err) =>
            Alert.alert(
              i18n.t('workers.err.saveTitle'),
              saveErrorMessage(err, i18n.t('workers.err.saveTitle')),
            ),
        },
      );
    },
    [activeWorker, closeSheet, isAdmin, myId, updateMutation],
  );

  const handleResetPassword = useCallback(
    (password: string) => {
      if (!isAdmin || !activeWorker) return;
      const name = `${activeWorker.firstName} ${activeWorker.lastName ?? ''}`.trim();
      resetMutation.mutate(
        { password },
        {
          onSuccess: () => {
            closeSheet();
            Alert.alert(
              i18n.t('workers.reset.doneTitle'),
              i18n.t('workers.reset.doneBody', { name: name || activeWorker.username }),
            );
          },
          onError: (err) =>
            Alert.alert(
              i18n.t('workers.err.resetTitle'),
              apiErrorMessage(err, i18n.t('workers.err.resetTitle')),
            ),
        },
      );
    },
    [activeWorker, closeSheet, isAdmin, resetMutation],
  );

  const requestRemove = useCallback(() => {
    if (!isAdmin || !activeWorker) return;
    // Guarded in the UI too: the server refuses self-deletion, and letting the
    // button through only to fail would read as a bug.
    if (activeWorker.id === myId) return;
    const name = `${activeWorker.firstName} ${activeWorker.lastName ?? ''}`.trim();
    Alert.alert(
      i18n.t('workers.remove.confirmTitle', { name: name || activeWorker.username }),
      i18n.t('workers.remove.confirmBody'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('workers.remove.confirm'),
          style: 'destructive',
          onPress: () =>
            deleteMutation.mutate(activeWorker.id, {
              onSuccess: closeSheet,
              onError: (err) =>
                Alert.alert(
                  i18n.t('workers.err.removeTitle'),
                  apiErrorMessage(err, i18n.t('workers.err.removeTitle')),
                ),
            }),
        },
      ],
    );
  }, [activeWorker, closeSheet, deleteMutation, isAdmin, myId]);

  return {
    workers,
    filtered,
    isAdmin,
    isLoading,
    isError,
    myId,
    refreshing,
    onRefresh,
    searchOpen,
    query,
    onOpenSearch,
    onCloseSearch,
    onChangeQuery,
    sheet,
    activeWorker,
    openActions,
    openAdd,
    openEdit,
    openReset,
    closeSheet,
    saving,
    handleCreate,
    handleEdit,
    handleResetPassword,
    requestRemove,
  };
}
