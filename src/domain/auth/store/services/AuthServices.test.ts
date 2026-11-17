import { AxiosError } from 'axios';

import { get, post } from '@/config/AxiosConfig';
import AuthService from '@/domain/auth/store/services/AuthServices';

jest.mock('@/config/EnvConfig', () => ({
  EnvConfig: { appEnv: 'dev', apiUrl: 'https://api.example.test' },
}));

jest.mock('@/config/AxiosConfig', () => ({ get: jest.fn(), post: jest.fn() }));

const mockedGet = jest.mocked(get);
const mockedPost = jest.mocked(post);

beforeEach(() => jest.clearAllMocks());

describe('AuthService', () => {
  it('asks for a reset link with the trimmed email', async () => {
    mockedPost.mockResolvedValue({ detail: 'If the account exists, a link is on its way.' });

    const result = await AuthService.requestPasswordReset('  helena@example.com ');

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/forgot-password/', {
      email: 'helena@example.com',
    });
    expect(result).toEqual({ data: { detail: 'If the account exists, a link is on its way.' } });
  });

  it('sends the refresh token to log out', async () => {
    mockedPost.mockResolvedValue(undefined);

    await expect(AuthService.logout('refresh-1')).resolves.toEqual({ data: null });
    expect(mockedPost).toHaveBeenCalledWith('/api/auth/logout/', { refresh: 'refresh-1' });
  });

  it('reads the signed-in user', async () => {
    mockedGet.mockResolvedValue({ session_timeout_minutes: 43200 });

    await expect(AuthService.getMe()).resolves.toEqual({
      data: { session_timeout_minutes: 43200 },
    });
    expect(mockedGet).toHaveBeenCalledWith('/api/auth/me/');
  });

  it('returns an error instead of throwing when offline', async () => {
    mockedPost.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'));

    await expect(AuthService.logout('refresh-1')).resolves.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('verifies and resends the emailed code', async () => {
    mockedPost.mockResolvedValue({});

    await AuthService.verifyTwoFactor('challenge-1', '892158');
    expect(mockedPost).toHaveBeenCalledWith('/api/auth/verify-2fa/', {
      challenge_id: 'challenge-1',
      code: '892158',
    });

    await AuthService.resendTwoFactor('challenge-1');
    expect(mockedPost).toHaveBeenCalledWith('/api/auth/resend-2fa/', {
      challenge_id: 'challenge-1',
    });
  });
});
