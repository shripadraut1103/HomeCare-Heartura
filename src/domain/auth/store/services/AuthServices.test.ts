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
  it('asks for a reset code with the trimmed email', async () => {
    mockedPost.mockResolvedValue({ detail: 'If that email exists, a code has been sent.' });

    const result = await AuthService.requestPasswordReset('  helena@example.com ');

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/forgot-password/', {
      email: 'helena@example.com',
    });
    expect(result).toEqual({ data: { detail: 'If that email exists, a code has been sent.' } });
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

  it('trades the emailed reset code for a reset token', async () => {
    mockedPost.mockResolvedValue({ reset_token: 'token-1' });

    const result = await AuthService.verifyResetCode(' helena@example.com ', '482913');

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/verify-reset-code/', {
      email: 'helena@example.com',
      code: '482913',
    });
    expect(result).toEqual({ data: { reset_token: 'token-1' } });
  });

  it('returns the reset code error code', async () => {
    mockedPost.mockRejectedValue(
      new AxiosError('Bad Request', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
        data: { error: { code: 'RESET_CODE_EXPIRED', message: 'Request a new code.' } },
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
      })
    );

    await expect(
      AuthService.verifyResetCode('helena@example.com', '000000')
    ).resolves.toMatchObject({
      code: 'RESET_CODE_EXPIRED',
      status: 400,
      error: 'Request a new code.',
    });
  });

  it('sets the new password with the reset token', async () => {
    mockedPost.mockResolvedValue({ detail: 'Password changed.' });

    await AuthService.resetPassword('token-1', 'N3w!password');

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/reset-password/', {
      token: 'token-1',
      new_password: 'N3w!password',
    });
  });

  it('changes the password of the signed-in user', async () => {
    mockedPost.mockResolvedValue({ detail: 'Password changed.' });

    const result = await AuthService.changePassword({
      currentPassword: 'Old!pass1',
      newPassword: 'N3w!password',
    });

    expect(mockedPost).toHaveBeenCalledWith('/api/auth/profile/password/', {
      current_password: 'Old!pass1',
      new_password: 'N3w!password',
    });
    expect(result).toEqual({ data: { detail: 'Password changed.' } });
  });
});
