export interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * PLACEHOLDER: confirm against the login API contract. When the real response
 * is known, type it here and add `loginData` / `profileData` to `AuthState`
 * if the app needs them.
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
