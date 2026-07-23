/**
 * The single typed HTTP client — the ONLY place `fetch` lives (docs/01 §1.3).
 * Everything above the Data layer calls a service; services call this. It:
 *
 *  - speaks the API envelope from docs/04 (`{ok:true,data}` / `{ok:false,error}`)
 *    and unwraps it, throwing a typed `ApiError` on failure;
 *  - attaches the in-memory access token as a Bearer header (never localStorage,
 *    docs/01 §2.2) via a registry the auth store updates;
 *  - sends `credentials: "include"` so the httpOnly refresh cookie rides along;
 *  - on a 401 INVALID_TOKEN, transparently rotates the access token via
 *    /auth/refresh once and retries the original request.
 */
import { config } from "./config";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: Array<{ path: string; issue: string }>;
  requestId?: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Array<{ path: string; issue: string }>;
  readonly requestId?: string;

  constructor(status: number, error: ApiErrorShape) {
    super(error.message);
    this.name = "ApiError";
    this.status = status;
    this.code = error.code;
    if (error.details) this.details = error.details;
    if (error.requestId) this.requestId = error.requestId;
  }
}

// --- access token registry (in memory only) -------------------------------
// The auth store (Logic) writes here; the client (Data) reads. No import back
// into Logic, so the boundary holds.
let accessToken: string | null = null;
export function setAccessToken(token: string | null): void {
  accessToken = token;
}
export function getAccessToken(): string | null {
  return accessToken;
}

type Envelope<T> = { ok: true; data: T } | { ok: false; error: ApiErrorShape };

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** internal: prevents infinite refresh recursion */
  _isRetry?: boolean;
  /** skip the automatic refresh-on-401 (used by refresh/login themselves) */
  skipAuthRefresh?: boolean;
}

async function parse<T>(res: Response): Promise<T> {
  const envelope = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!envelope) {
    throw new ApiError(res.status, {
      code: "INTERNAL",
      message: "Malformed response from server.",
    });
  }
  if (envelope.ok) return envelope.data;
  throw new ApiError(res.status, envelope.error);
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${config.apiUrl}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await parse<{ accessToken: string }>(res);
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${config.apiUrl}/api${path}`, {
    method: options.method ?? "GET",
    headers,
    credentials: "include",
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  // Transparent one-shot refresh on an expired/invalid access token.
  if (res.status === 401 && !options._isRetry && !options.skipAuthRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, { ...options, _isRetry: true });
  }

  return parse<T>(res);
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, opts?: Pick<RequestOptions, "skipAuthRefresh">) =>
    request<T>(path, { method: "POST", ...(body !== undefined ? { body } : {}), ...opts }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", ...(body !== undefined ? { body } : {}) }),
};
