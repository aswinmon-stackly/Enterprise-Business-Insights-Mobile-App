import { API_BASE_URL } from '../config/env';

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'aborted';

export class ApiError extends Error {
  constructor(public readonly kind: ApiErrorKind, message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

interface GetOptions { signal?: AbortSignal; timeoutMs?: number }

/** The only place that calls fetch(). Adds a timeout, cancellation and typed errors. */
export async function apiGet<T>(path: string, { signal, timeoutMs = 10000 }: GetOptions = {}): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
    } catch {
      throw new ApiError(timedOut ? 'timeout' : signal?.aborted ? 'aborted' : 'network', `Request to ${path} failed`);
    }
    if (!res.ok) throw new ApiError('http', `HTTP ${res.status} for ${path}`, res.status);
    try {
      return await res.json(); // body is validated server-side by Pydantic; typed here via T
    } catch {
      throw new ApiError('parse', `Invalid JSON from ${path}`);
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

/** User-facing copy only. Raw details go to the dev console, never to the UI. */
export function getErrorMessage(e: unknown): string {
  if (__DEV__) console.warn('[api]', e);
  if (e instanceof ApiError) {
    if (e.kind === 'timeout' || e.kind === 'network') return 'Unable to reach the server. Check your connection and try again.';
    if (e.kind === 'http' && (e.status ?? 0) >= 500) return 'The server ran into a problem. Please try again shortly.';
    if (e.kind === 'parse') return 'We received an unexpected response. Please try again.';
  }
  return 'Something went wrong while loading the dashboard.';
}
