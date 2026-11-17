import type { AuthMe, LoginResponse } from '@/domain/auth/interfaces/AuthInterfaces';

export const MOCK_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '1234',
};

export const MOCK_USER = {
  name: 'Helena Ruiz, DPT',
  organization: 'HomeCare Therapeutics',
};

export const MOCK_ME: AuthMe = {
  member: { permission_codes: [] },
  session_timeout_minutes: 43200,
};

export const MOCK_LOGIN_RESPONSE: LoginResponse = {
  two_factor_required: false,
  me: MOCK_ME,
  tokens: {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
    access_expires_at: '2099-01-01T00:00:00Z',
    refresh_expires_at: '2099-01-01T00:00:00Z',
  },
};
