import type { LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import type { LoginResponse } from '@/domain/auth/interfaces/AuthInterfaces';
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
  async login(_data: LoginFormValues): Promise<ServiceResult<LoginResponse>> {
    // Once the login contract and AxiosConfig exist:
    // try {
    //   const response = await post<LoginResponse>('<login endpoint>', data);
    //   return { data: response };
    // } catch (error) {
    //   return { error: getErrorMessage(error), status: <HTTP status from error> };
    // }
    return { error: 'Sign in is not available yet. Please try again later.', status: null };
  }
}

export default new AuthService();
