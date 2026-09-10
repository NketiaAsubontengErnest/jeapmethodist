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

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(!skipAuth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

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

