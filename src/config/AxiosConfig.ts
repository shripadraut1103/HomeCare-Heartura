import { create, type AxiosRequestConfig } from 'axios';

import { EnvConfig } from '@/config/EnvConfig';

const REQUEST_TIMEOUT_MS = 30_000;

const CLIENT = 'mobile';
const PORTAL = 'provider';

const PUBLIC_PATHS = [
  '/api/auth/login/',
  '/api/auth/verify-2fa/',
  '/api/auth/resend-2fa/',
  '/api/auth/refresh-token/',
  '/api/auth/forgot-password/',
];

type ApiSession = {
  getTenant: () => string | null;
  getAccessToken: () => string | null;
};

let session: ApiSession = {
  getTenant: () => null,
  getAccessToken: () => null,
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
