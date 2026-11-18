import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { apiClient, configureApiSession, get } from '@/config/AxiosConfig';

jest.mock('@/config/EnvConfig', () => ({
  EnvConfig: { appEnv: 'dev', apiUrl: 'https://api.example.test' },
}));

const tokens = (n: number) => ({
  access: `access-${n}`,
  refresh: `refresh-${n}`,
  access_expires_at: '2026-11-18T10:15:00Z',
  refresh_expires_at: '2026-12-18T10:00:00Z',
});

const reply = (config: InternalAxiosRequestConfig, status: number, data: unknown) => {
  const response = { data, status, statusText: '', headers: {}, config } as AxiosResponse;
  if (status >= 400) throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, response);
  return response;
};

const expired = {
  error: { message: 'Your session has expired.', code: 'AUTH_EXPIRED', details: {} },
};

function setup({ refreshWorks = true } = {}) {
  let access = 'access-1';
  let refresh: string | null = 'refresh-1';
  const onTokensRefreshed = jest.fn((next) => {
    access = next.access;
    refresh = next.refresh;
  });
  const onSessionEnded = jest.fn(() => {
    refresh = null;
  });
  let refreshCalls = 0;
  const adapter: AxiosAdapter = async (config) => {
    if (config.url === '/api/auth/refresh-token/') {
      refreshCalls += 1;
      return refreshWorks ? reply(config, 200, { tokens: tokens(2) }) : reply(config, 401, expired);
    }
    return config.headers.get('Authorization') === 'Bearer access-2'
      ? reply(config, 200, { ok: true })
      : reply(config, 401, expired);
  };
  apiClient.defaults.adapter = adapter;
  configureApiSession({
    getTenant: () => null,
    getAccessToken: () => access,
    getRefreshToken: () => refresh,
    onTokensRefreshed,
    onSessionEnded,
  });
  return { onTokensRefreshed, onSessionEnded, refreshCalls: () => refreshCalls };
}

describe('expired access token', () => {
  it('refreshes once and retries the request with the new token', async () => {
    const session = setup();

    await expect(get('/api/auth/me/')).resolves.toEqual({ ok: true });
    expect(session.onTokensRefreshed).toHaveBeenCalledWith(tokens(2));
    expect(session.onSessionEnded).not.toHaveBeenCalled();
  });

  it('shares one refresh between requests that fail together', async () => {
    const session = setup();

    await Promise.all([get('/api/auth/me/'), get('/api/scheduling/appointments/')]);
    expect(session.refreshCalls()).toBe(1);
  });

  it('ends the session once when the refresh token is no longer valid', async () => {
    const session = setup({ refreshWorks: false });

    const results = await Promise.allSettled([
      get('/api/auth/me/'),
      get('/api/scheduling/appointments/'),
    ]);
    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(session.onSessionEnded).toHaveBeenCalledTimes(1);
  });

  it('ends the session at once on a token from another organization', async () => {
    const session = setup();
    apiClient.defaults.adapter = async (config) =>
      reply(config, 401, {
        error: { message: 'Wrong organization.', code: 'TENANT_MISMATCH', details: {} },
      });

    await expect(get('/api/auth/me/')).rejects.toBeInstanceOf(AxiosError);
    expect(session.onSessionEnded).toHaveBeenCalledTimes(1);
  });
});

describe('non-JSON replies', () => {
  it('treats a web page from the CDN as a server error', async () => {
    setup();
    apiClient.defaults.adapter = async (config) =>
      ({
        data: '<!doctype html><html></html>',
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'text/html' },
        config,
      }) as AxiosResponse;

    await expect(get('/api/scheduling/appointments/')).rejects.toMatchObject({
      response: { status: 502 },
    });
  });
});
