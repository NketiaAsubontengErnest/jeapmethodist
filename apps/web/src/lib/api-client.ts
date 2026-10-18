if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Local dev reads it from apps/web/.env.local; production builds read it from apps/web/.env.production.',
  );
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** In-memory only — never persisted to localStorage/sessionStorage to limit XSS exposure. */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Skip attaching the Authorization header (used for login/refresh calls). */
  skipAuth?: boolean;
}

/** Fired when the session can no longer be refreshed, so AuthProvider can sign the user out. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

// Shared by concurrent 401s so only one refresh call is made — refresh tokens
// are rotated, so parallel refreshes would invalidate each other.
let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { accessToken?: string };
        if (!data.accessToken) return false;
        accessToken = data.accessToken;
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const send = () =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(!skipAuth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
    });

  let response = await send();

  // The 15-minute access token expires while the dashboard stays open; silently
  // renew it from the refresh cookie and retry once instead of failing the page.
  if (response.status === 401 && !skipAuth && accessToken) {
    if (await refreshAccessToken()) {
      response = await send();
    } else {
      accessToken = null;
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = (body && (body.message as string | string[])) || response.statusText;
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>(path, { method: 'DELETE', ...options }),
};

