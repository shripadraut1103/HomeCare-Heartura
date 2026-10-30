import type { LoginResponse } from '@/domain/auth/interfaces/AuthInterfaces';

export const MOCK_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '1234',
};

export const MOCK_USER = {
  name: 'Helena Ruiz, DPT',
  organization: 'HomeCare Therapeutics',
};

export const MOCK_LOGIN_RESPONSE: LoginResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};
