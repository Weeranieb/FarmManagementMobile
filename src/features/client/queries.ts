import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useIsAuthenticated } from '@/features/auth';
import { http } from '@/shared/http';
import type { ClientResponse } from './types';

/**
 * Whether this client runs tourist fishing (ตกปลา) — the per-client switch an
 * admin toggles in the web master-data screen.
 *
 * Defaults to `true` while the record is loading or unavailable, so the ตกปลา
 * column is only ever *removed* on a confirmed `false`. Defaulting the other
 * way would blink the column out of the daily log on every cold open, and — far
 * worse — would silently hide an input a client actively uses whenever the
 * request fails.
 */
export function useTouristFishingEnabled(): boolean {
  const isAuth = useIsAuthenticated();
  // `null` means a super-admin account with no client scope — nothing to fetch.
  const clientId = useAuthStore((s) => s.user?.clientId ?? null);
  const { data } = useQuery<ClientResponse>({
    queryKey: ['client', clientId],
    // `GET /client/:id` is guarded by `requireClientAccess`, not super-admin, so
    // a normal operator can read their own client record (backend
    // handler/client_handler.go).
    queryFn: () => http.get<ClientResponse>(`/client/${clientId}`),
    enabled: isAuth && clientId != null,
    // Feature switches change about as often as never — an admin toggling one
    // is a deliberate, rare act. Keep it out of the request path for the
    // session rather than refetching it alongside every screen.
    staleTime: 30 * 60_000,
  });
  return data?.isTouristFishingEnabled ?? true;
}
