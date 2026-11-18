import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

import { apiClient, configureApiSession } from '@/config/AxiosConfig';

jest.mock('@/config/EnvConfig', () => ({
  EnvConfig: { appEnv: 'dev', apiUrl: 'https://api.example.test' },
}));

const session = {
  getTenant: () => null,
  getAccessToken: () => null,
  getRefreshToken: () => null,
  onTokensRefreshed: jest.fn(),
  onSessionEnded: jest.fn(),
};

const sentHeaders = async (url: string) => {
  let captured: InternalAxiosRequestConfig | undefined;
  const adapter: AxiosAdapter = async (config) => {
    captured = config;
    return { data: null, status: 200, statusText: 'OK', headers: {}, config };
  };
  await apiClient.get(url, { adapter });
  return captured!.headers;
};

describe('apiClient', () => {
  it('sends the mobile headers on every request', async () => {
    configureApiSession({ ...session, getTenant: () => 'hope' });
    const headers = await sentHeaders('/api/auth/login/');

    expect(headers.get('X-Client')).toBe('mobile');
    expect(headers.get('X-Portal')).toBe('provider');
    expect(headers.get('X-Tenant')).toBe('hope');
    expect(headers.get('X-Timezone')).toEqual(expect.any(String));
    expect(headers.get('Authorization')).toBeUndefined();
  });

  it('adds the access token to authenticated calls only', async () => {
    configureApiSession({ ...session, getTenant: () => 'hope', getAccessToken: () => 'access-1' });

    expect((await sentHeaders('/api/auth/me/')).get('Authorization')).toBe('Bearer access-1');
    expect((await sentHeaders('/api/auth/refresh-token/')).get('Authorization')).toBeUndefined();
  });

  it('sends an empty X-Tenant until an organization is chosen', async () => {
    configureApiSession(session);

    expect((await sentHeaders('/api/auth/login/')).get('X-Tenant')).toBe('');
  });
});
