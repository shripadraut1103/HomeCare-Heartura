import type { LoginResponse } from '@/domain/auth/interfaces/AuthInterfaces';

/**
 * TEMPORARY: lets the team sign in before the login API exists.
 * Delete this file once `AuthService.login` calls the real endpoint.
 */
export const MOCK_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '1234',
};

export const MOCK_LOGIN_RESPONSE: LoginResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};
