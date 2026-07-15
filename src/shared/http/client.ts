// Thin fetch wrapper for the FarmOS Go backend at /api/v1.
// - Reads base URL from EXPO_PUBLIC_API_URL.
// - On Android emulator, rewrites localhost/127.0.0.1 → 10.0.2.2 so the app can reach the host machine.
// - Auto-attaches Authorization: Bearer <jwt> if the auth store has a token.
// - Maps backend error envelopes ({ code, message }) to ApiError.

import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Deep import on purpose: the http client needs the auth token but should not
// depend on the auth feature's public barrel (which would create a cycle when
// the auth service imports from this module).
import { useAuthStore } from '@/features/auth/store';
import type { ApiError } from './errors';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: QueryParams;
};

function resolveBackendBaseUrl(raw: string): string {
  const fallback = 'http://localhost:8080';
  const value = raw.trim() || fallback;

  let url: URL;
  try {
    url = new URL(value.includes('://') ? value : `http://${value}`);
  } catch {
    return value;
  }

  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  if (Platform.OS === 'android' && local && !Device.isDevice) {
    url.hostname = '10.0.2.2';
  }

  let out = url.toString();
  if (out.endsWith('/')) out = out.slice(0, -1);
  return out;
}

const RAW_BASE = resolveBackendBaseUrl(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080');
const API_BASE = `${RAW_BASE}/api/v1`;

function buildUrl(path: string, query?: QueryParams): string {
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

async function readJsonSafely(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeApiError(body: unknown, status: number, fallbackMessage: string): ApiError {
  const obj = toRecord(body);
  const nestedError = obj.error && typeof obj.error === 'object' ? toRecord(obj.error) : null;
  const code =
    (nestedError && typeof nestedError.code === 'string' ? nestedError.code : null) ??
    (typeof obj.code === 'string' ? obj.code : String(status));
  const message =
    (nestedError && typeof nestedError.message === 'string' ? nestedError.message : null) ??
    (typeof obj.message === 'string'
      ? obj.message
      : typeof obj.error === 'string'
        ? obj.error
        : fallbackMessage);
  const details =
    (nestedError && typeof nestedError.details === 'string' ? nestedError.details : null) ??
    (typeof obj.details === 'string' ? obj.details : undefined);

  return { code, message, details, status };
}

async function parseError(res: Response): Promise<ApiError> {
  const body = await readJsonSafely(res);
  return normalizeApiError(body, res.status, res.statusText || 'Request failed');
}

/**
 * Go handlers use `http.Success` / `http.Error` → body is
 * `{ result: true, data: T }` or `{ error: { code, message } }`.
 * `http.NewError` returns a flat `{ code, message }`.
 */
function unwrapSuccessBody(json: unknown, res: Response): unknown {
  if (!json || typeof json !== 'object') return json;

  const obj = toRecord(json);

  if (obj.result === true) {
    return obj.data;
  }

  if (obj.error != null && typeof obj.error === 'object') {
    throw normalizeApiError(obj, res.status, res.statusText || 'Request failed');
  }

  if (typeof obj.code === 'string' && typeof obj.message === 'string' && obj.result !== true) {
    const details = typeof obj.details === 'string' ? obj.details : undefined;
    throw {
      code: obj.code,
      message: obj.message,
      details,
      status: res.status,
    } satisfies ApiError;
  }

  return json;
}

function buildHeaders(token: string | null, headers?: HeadersInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers ?? {}),
  };
}

async function apiFetch<TResponse>(path: string, options: FetchOptions = {}): Promise<TResponse> {
  const { body, query, headers, ...rest } = options;
  const token = useAuthStore.getState().token;

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: buildHeaders(token, headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    useAuthStore.getState().clear();
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) return undefined as TResponse;

  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return undefined as TResponse;

  const json = await readJsonSafely(res);
  const payload = unwrapSuccessBody(json, res);
  return payload as TResponse;
}

export const http = {
  get<TResponse>(path: string, query?: QueryParams): Promise<TResponse> {
    return apiFetch<TResponse>(path, { method: 'GET', query });
  },
  post<TResponse>(path: string, body?: unknown): Promise<TResponse> {
    return apiFetch<TResponse>(path, { method: 'POST', body });
  },
  put<TResponse>(path: string, body?: unknown): Promise<TResponse> {
    return apiFetch<TResponse>(path, { method: 'PUT', body });
  },
  patch<TResponse>(path: string, body?: unknown): Promise<TResponse> {
    return apiFetch<TResponse>(path, { method: 'PATCH', body });
  },
  delete<TResponse>(path: string): Promise<TResponse> {
    return apiFetch<TResponse>(path, { method: 'DELETE' });
  },
};
