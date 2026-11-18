import { AxiosError, create, isAxiosError, type AxiosRequestConfig } from 'axios';

import { EnvConfig } from '@/config/EnvConfig';
import type { AuthTokens } from '@/domain/auth/interfaces/AuthInterfaces';

const REQUEST_TIMEOUT_MS = 30_000;

const CLIENT = 'mobile';
const PORTAL = 'provider';

const REFRESH_PATH = '/api/auth/refresh-token/';

const PUBLIC_PATHS = [
  '/api/auth/login/',
  '/api/auth/verify-2fa/',
  '/api/auth/resend-2fa/',
  REFRESH_PATH,
  '/api/auth/forgot-password/',
];

const SESSION_ENDED_CODES = ['AUTH_REQUIRED', 'TENANT_MISMATCH'];

type ApiSession = {
  getTenant: () => string | null;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokensRefreshed: (tokens: AuthTokens) => void;
  onSessionEnded: () => void;
};

let session: ApiSession = {
  getTenant: () => null,
  getAccessToken: () => null,
  getRefreshToken: () => null,
  onTokensRefreshed: () => {},
  onSessionEnded: () => {},
};

export function configureApiSession(next: ApiSession) {
  session = next;
}

const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const apiClient = create({
  baseURL: EnvConfig.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.headers.set('X-Client', CLIENT);
  config.headers.set('X-Portal', PORTAL);
  config.headers.set('X-Timezone', deviceTimeZone());

  config.headers.set('X-Tenant', session.getTenant() ?? '');

  const accessToken = session.getAccessToken();
  const isPublic = PUBLIC_PATHS.some((path) => config.url?.startsWith(path));
  if (accessToken && !isPublic) config.headers.set('Authorization', `Bearer ${accessToken}`);

  return config;
});

// A reply that isn't JSON (for example a web page served by the CDN) is never a valid API answer.
apiClient.interceptors.response.use((response) => {
  const contentType = String(response.headers['content-type'] ?? '');
  if (!contentType.includes('text/html')) return response;
  throw new AxiosError(
    'The server sent a web page instead of data.',
    'ERR_BAD_RESPONSE',
    response.config,
    response.request,
    { ...response, status: 502 }
  );
});

// Development only: one line per call with method, path and status. Never bodies or tokens (PHI).
if (__DEV__) {
  const label = (config?: AxiosRequestConfig) =>
    `${(config?.method ?? 'get').toUpperCase()} ${config?.url ?? ''}${
      config?.params ? `?${new URLSearchParams(config.params).toString()}` : ''
    }`;
  apiClient.interceptors.request.use((config) => {
    console.log(`[api] → ${label(config)}`);
    return config;
  });
  apiClient.interceptors.response.use(
    (response) => {
      console.log(`[api] ← ${response.status} ${label(response.config)}`);
      return response;
    },
    (error: unknown) => {
      if (isAxiosError(error)) {
        const code = (error.response?.data as { error?: { code?: string } } | undefined)?.error
          ?.code;
        console.log(
          `[api] ✕ ${error.response?.status ?? error.code ?? 'failed'}${code ? ` ${code}` : ''} ${label(error.config)}`
        );
      }
      throw error;
    }
  );
}

let refreshing: Promise<boolean> | null = null;

/** One refresh at a time: requests that fail together all wait for the same refresh. */
function refreshOnce() {
  refreshing ??= (async () => {
    const refresh = session.getRefreshToken();
    if (!refresh) return false;
    try {
      const response = await apiClient.post<{ tokens: AuthTokens }>(REFRESH_PATH, { refresh });
      session.onTokensRefreshed(response.data.tokens);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

type RetryableConfig = AxiosRequestConfig & { retried?: boolean };

const errorCode = (data: unknown) => {
  const error = (data as { error?: { code?: unknown } } | null)?.error;
  return typeof error?.code === 'string' ? error.code : undefined;
};

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error) || !error.config || error.response?.status !== 401) throw error;
  const config: RetryableConfig = error.config;
  const code = errorCode(error.response.data);
  const hadSession = session.getRefreshToken() !== null;

  if (config.url?.startsWith(REFRESH_PATH)) throw error;

  if (code === 'AUTH_EXPIRED' && hadSession && !config.retried) {
    if (await refreshOnce()) {
      config.retried = true;
      return apiClient(config);
    }
    if (session.getRefreshToken() !== null) session.onSessionEnded();
    throw error;
  }

  if (code && SESSION_ENDED_CODES.includes(code) && hadSession) session.onSessionEnded();
  throw error;
});

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, body, config);
  return response.data;
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, body, config);
  return response.data;
}

export async function patch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(url, body, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}
