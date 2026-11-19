export interface AuthTokens {
  access: string;
  refresh: string;
  access_expires_at: string;
  refresh_expires_at: string;
}

export interface AuthMe {
  organization?: { slug: string; name: string; timezone: string } | null;
  member?: { id: string; permission_codes?: string[] } | null;
  session_timeout_minutes?: number;
  [field: string]: unknown;
}

export interface TwoFactorRequired {
  two_factor_required: true;
  challenge_id: string;
  challenge_expires_at: string;
}

export interface SignedIn {
  two_factor_required: false;
  me: AuthMe;
  tokens: AuthTokens;
}

export type LoginResponse = TwoFactorRequired | SignedIn;

export interface TwoFactorChallenge {
  id: string;
  expiresAt: string;
  email: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  accessExpiresAt: string | null;
  refreshExpiresAt: string | null;
  me: AuthMe | null;
  challenge: TwoFactorChallenge | null;
}

export interface ResetCodeVerified {
  reset_token: string;
}
