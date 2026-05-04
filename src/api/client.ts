// Thin fetch wrapper for the FarmOS Go backend at /api/v1.
// - Reads base URL from EXPO_PUBLIC_API_URL.
// - Auto-attaches Authorization: Bearer <jwt> if the auth store has a token.
// - Maps backend error envelopes ({ code, message }) to ApiError.

import { useAuthStore } from '@/store/auth';
import type { ApiError } from './types';

const RAW_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const API_BASE = `${RAW_BASE.replace(/\/$/, '')}/api/v1`;

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: FetchOptions['query']): string {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const nested =
    obj.error && typeof obj.error === 'object' ? (obj.error as Record<string, unknown>) : null;
  const code =
    (nested && typeof nested.code === 'string' ? nested.code : null) ??
    (typeof obj.code === 'string' ? obj.code : String(res.status));
  const message =
    (nested && typeof nested.message === 'string' ? nested.message : null) ??
    (typeof obj.message === 'string'
      ? obj.message
      : typeof obj.error === 'string'
        ? obj.error
        : res.statusText || 'Request failed');
  return { code, message, status: res.status };
}

/**
 * Go handlers use `http.Success` / `http.Error` → body is
 * `{ result: true, data: T }` or `{ error: { code, message } }`.
 * `http.NewError` returns a flat `{ code, message }`.
 */
function unwrapSuccessBody(json: unknown, res: Response): unknown {
  if (!json || typeof json !== 'object') return json;
  const obj = json as Record<string, unknown>;

  if (obj.result === true) {
    return obj.data;
  }

  if (obj.error != null && typeof obj.error === 'object') {
    const er = obj.error as Record<string, unknown>;
    const code = typeof er.code === 'string' ? er.code : String(er.code ?? res.status);
    const message =
      typeof er.message === 'string' ? er.message : res.statusText || 'Request failed';
    throw { code, message, status: res.status } satisfies ApiError;
  }

  if (typeof obj.code === 'string' && typeof obj.message === 'string' && obj.result !== true) {
    throw { code: obj.code, message: obj.message, status: res.status } satisfies ApiError;
  }

  return json;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const token = useAuthStore.getState().token;

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    useAuthStore.getState().clear();
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) return undefined as T;
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return undefined as T;
  const json = await res.json();
  const payload = unwrapSuccessBody(json, res);
  return payload as T;
}

export const api = {
  get: <T>(path: string, query?: FetchOptions['query']): Promise<T> =>
    apiFetch<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown): Promise<T> => apiFetch<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string): Promise<T> => apiFetch<T>(path, { method: 'DELETE' }),
};

export const API_BASE_URL = API_BASE;
