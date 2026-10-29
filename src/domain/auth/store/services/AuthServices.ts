import type { LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import type { LoginResponse } from '@/domain/auth/interfaces/AuthInterfaces';
import { MOCK_CREDENTIALS, MOCK_LOGIN_RESPONSE } from '@/domain/auth/mocks/AuthMocks';
import type { ServiceResult } from '@/types/ServiceInterfaces';

/**
 * Service layer convention (see PROJECT_ARCHITECTURE.md):
 * - One class per domain, default-exported as a singleton instance.
 * - All HTTP goes through the shared Axios helpers in `src/config/AxiosConfig.ts`
 *   (`get` / `post` / … on one Axios instance with base URL, headers and token
 *   interceptors). That file does not exist yet; create it with the first real API.
 * - Services never throw: on failure they resolve to `{ error, status }`.
 * - Endpoint paths come from the API contract, never guessed.
 */
class AuthService {
  async login(data: LoginFormValues): Promise<ServiceResult<LoginResponse>> {
    // Once the login contract and AxiosConfig exist:
    // try {
    //   const response = await post<LoginResponse>('<login endpoint>', data);
    //   return { data: response };
    // } catch (error) {
    //   return { error: getErrorMessage(error), status: <HTTP status from error> };
    // }
    // TEMPORARY: mock sign-in until the API exists (see AuthMocks.ts).
    const isMockUser =
      data.email.trim().toLowerCase() === MOCK_CREDENTIALS.email &&
      data.password === MOCK_CREDENTIALS.password;
    if (isMockUser) {
      return { data: MOCK_LOGIN_RESPONSE };
    }
    return { error: 'Incorrect email or password.', status: 401 };
  }

  async requestPasswordReset(_email: string): Promise<ServiceResult<null>> {
    // Once the reset contract and AxiosConfig exist:
    // try {
    //   await post('<reset password endpoint>', { email });
    //   return { data: null };
    // } catch (error) {
    //   return { error: getErrorMessage(error), status: <HTTP status from error> };
    // }
    // TEMPORARY: always reports success until the API exists.
    return { data: null };
  }
}

export default new AuthService();
