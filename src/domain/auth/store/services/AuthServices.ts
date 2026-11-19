import { callApi } from '@/config/ApiError';
import { get, post } from '@/config/AxiosConfig';
import type {
  AuthMe,
  LoginResponse,
  SignedIn,
  TwoFactorRequired,
} from '@/domain/auth/interfaces/AuthInterfaces';
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
    return callApi(() =>
      post<LoginResponse>(AUTH_ENDPOINTS.login, {
        email: data.email.trim(),
        password: data.password,
      })
    );
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
    return callApi(() =>
      post<{ detail: string }>(AUTH_ENDPOINTS.forgotPassword, { email: email.trim() })
    );
  }

  async logout(refresh: string): Promise<ServiceResult<null>> {
    return callApi(async () => {
      await post(AUTH_ENDPOINTS.logout, { refresh });
      return null;
    });
  }

  async getMe(): Promise<ServiceResult<AuthMe>> {
    return callApi(() => get<AuthMe>(AUTH_ENDPOINTS.me));
  }

  // TODO: call the change password endpoint once the backend shares it.
  async changePassword(_data: {
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
    return { data: null };
  }
}

export default new AuthService();
