import { http } from '@/shared/http';
import type { UserResponse } from '@/features/auth';
import type {
  CreateWorkerRequest,
  ResetWorkerPasswordRequest,
  UpdateWorkerRequest,
} from './types';

/**
 * GET /user/list — the client's staff roster.
 *
 * The server forcibly scopes this to the caller's own client (a `clientId` query
 * param is honoured for super admins only), so there is nothing to pass.
 */
export async function listWorkers(): Promise<UserResponse[]> {
  const payload = await http.get<unknown>('/user/list');
  return Array.isArray(payload) ? (payload as UserResponse[]) : [];
}

/** POST /user — returns the created account. */
export function createWorker(body: CreateWorkerRequest): Promise<UserResponse> {
  return http.post<UserResponse>('/user', body);
}

/** PUT /user/:id */
export function updateWorker(id: number, body: UpdateWorkerRequest): Promise<unknown> {
  return http.put(`/user/${id}`, body);
}

/** PUT /user/:id/password — admin reset; the target's current password is not
 *  needed and is not asked for. */
export function resetWorkerPassword(
  id: number,
  body: ResetWorkerPasswordRequest,
): Promise<unknown> {
  return http.put(`/user/${id}/password`, body);
}

/** DELETE /user/:id — soft-delete on the backend. */
export function deleteWorker(id: number): Promise<unknown> {
  return http.delete(`/user/${id}`);
}
