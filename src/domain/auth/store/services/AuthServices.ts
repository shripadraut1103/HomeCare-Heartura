import { callApi, serviceError } from '@/config/ApiError';
import { get, post } from '@/config/AxiosConfig';
import { EnvConfig } from '@/config/EnvConfig';
import type {
  AuthMe,
  LoginResponse,
  SignedIn,
  TwoFactorRequired,
} from '@/domain/auth/interfaces/AuthInterfaces';
import { MOCK_CREDENTIALS, MOCK_ME } from '@/domain/auth/mocks/AuthMocks';
import type { LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const AUTH_ENDPOINTS = {
  login: '/api/auth/login/',
  verifyTwoFactor: '/api/auth/verify-2fa/',
  resendTwoFactor: '/api/auth/resend-2fa/',
  logout: '/api/auth/logout/',
  me: '/api/auth/me/',
  forgotPassword: '/api/auth/forgot-password/',
} as const;

/**
 * Service layer convention (see PROJECT_ARCHITECTURE.md):
 * - One class per domain, default-exported as a singleton instance.
 * - All HTTP goes through the shared helpers in `src/config/AxiosConfig.ts`, wrapped in
 *   `callApi` so services never throw: failures resolve to a `ServiceError`.
 * - Endpoint paths come from the API contract, never guessed.
 */
class AuthService {
  async login(data: LoginFormValues): Promise<ServiceResult<LoginResponse>> {
    if (EnvConfig.apiUrl) {
      return callApi(() =>
        post<LoginResponse>(AUTH_ENDPOINTS.login, {
          email: data.email.trim(),
          password: data.password,
        })
      );
    }

    return serviceError('AUTH_FAILED', 'Incorrect email or password.', 401);
  }

  async verifyTwoFactor(challengeId: string, code: string): Promise<ServiceResult<SignedIn>> {
    return callApi(() =>
      post<SignedIn>(AUTH_ENDPOINTS.verifyTwoFactor, { challenge_id: challengeId, code })
    );
  }

  async resendTwoFactor(challengeId: string): Promise<ServiceResult<TwoFactorRequired>> {
    return callApi(() =>
      post<TwoFactorRequired>(AUTH_ENDPOINTS.resendTwoFactor, { challenge_id: challengeId })
    );
  }

  async requestPasswordReset(email: string): Promise<ServiceResult<{ detail: string }>> {
    if (EnvConfig.apiUrl) {
      return callApi(() =>
        post<{ detail: string }>(AUTH_ENDPOINTS.forgotPassword, { email: email.trim() })
      );
    }
    // TEMPORARY: always reports success while no API URL is configured.
    return { data: { detail: 'Reset link sent.' } };
  }

  async logout(refresh: string): Promise<ServiceResult<null>> {
    if (EnvConfig.apiUrl) {
      return callApi(async () => {
        await post(AUTH_ENDPOINTS.logout, { refresh });
        return null;
      });
    }
    return { data: null };
  }

  async getMe(): Promise<ServiceResult<AuthMe>> {
    if (EnvConfig.apiUrl) {
      return callApi(() => get<AuthMe>(AUTH_ENDPOINTS.me));
    }
    // TEMPORARY: mock profile while no API URL is configured (see AuthMocks.ts).
    return { data: MOCK_ME };
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ServiceResult<null>> {
    // Once the change password contract and AxiosConfig exist:
    // try {
    //   await post('<change password endpoint>', data);
    //   return { data: null };
    // } catch (error) {
    //   return { error: getErrorMessage(error), status: <HTTP status from error> };
    // }
    // TEMPORARY: checks against the mock user until the API exists (see AuthMocks.ts).
    if (data.currentPassword !== MOCK_CREDENTIALS.password) {
      return serviceError('AUTH_FAILED', 'Your current password is incorrect.', 401);
    }
    return { data: null };
  }
}

export default new AuthService();
