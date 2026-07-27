import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isClientAdmin, useAuthStore, useIsAuthenticated } from '@/features/auth';
import type { UserResponse } from '@/features/auth';
import {
  createWorker,
  deleteWorker,
  listWorkers,
  resetWorkerPassword,
  updateWorker,
} from './service';
import type {
  CreateWorkerRequest,
  ResetWorkerPasswordRequest,
  UpdateWorkerRequest,
} from './types';

export const userKeys = {
  all: () => ['users'] as const,
  list: () => ['users', 'list'] as const,
} as const;

/**
 * The client's staff roster.
 *
 * Gated on client-admin rather than merely being signed in: every mutation on
 * this screen requires it, so a worker who somehow reached the screen would see
 * a list it could do nothing with. (`GET /user/list` itself is open to any
 * authenticated user of the client.)
 */
export function useWorkers() {
  const isAuth = useIsAuthenticated();
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: listWorkers,
    enabled: isAuth && isClientAdmin(user),
  });
}

type DataState<T> = { data: T; isLoading: boolean; isError: boolean };

export function useWorkersData(): DataState<UserResponse[]> {
  const q = useWorkers();
  if (q.isPending) return { data: [], isLoading: true, isError: false };
  if (q.isError || !Array.isArray(q.data)) return { data: [], isLoading: false, isError: true };
  return { data: q.data, isLoading: false, isError: false };
}

export function useCreateWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkerRequest) => createWorker(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: userKeys.all() }),
  });
}

export function useUpdateWorker(id: number) {
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const refreshMe = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (body: UpdateWorkerRequest) => updateWorker(id, body),
    onSuccess: (_data, body) => {
      void qc.invalidateQueries({ queryKey: userKeys.all() });
      // An admin editing its own row through this screen would otherwise leave a
      // stale name/username in the auth store, which the profile and every
      // "โดยคุณ" byline read from.
      if (me?.id === id) {
        void refreshMe({
          username: body.username,
          firstName: body.firstName,
          lastName: body.lastName ?? null,
          email: body.email ?? null,
          contactNumber: body.contactNumber,
        });
      }
    },
  });
}

export function useResetWorkerPassword(id: number) {
  return useMutation({
    mutationFn: (body: ResetWorkerPasswordRequest) => resetWorkerPassword(id, body),
  });
}

export function useDeleteWorker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWorker(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: userKeys.all() }),
  });
}
