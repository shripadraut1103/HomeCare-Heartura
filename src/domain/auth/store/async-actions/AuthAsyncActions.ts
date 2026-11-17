import { createAsyncThunk } from '@reduxjs/toolkit';

import type { LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import AuthService from '@/domain/auth/store/services/AuthServices';
import type {
  AuthMe,
  LoginResponse,
  SignedIn,
  TwoFactorRequired,
} from '@/domain/auth/interfaces/AuthInterfaces';
import type { ServiceResult } from '@/types/ServiceInterfaces';
import { AUTH_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';

export const loginAction = createAsyncThunk<
  ServiceResult<LoginResponse>,
  LoginFormValues,
  { state: RootState }
>(AUTH_REDUCER + '/login', async (data) => AuthService.login(data));

export const fetchMeAction = createAsyncThunk<ServiceResult<AuthMe>, void, { state: RootState }>(
  AUTH_REDUCER + '/fetchMe',
  async () => AuthService.getMe()
);

// The server call is best effort: the session is cleared on this device even if it fails offline.
export const logoutAction = createAsyncThunk<void, void, { state: RootState }>(
  AUTH_REDUCER + '/logout',
  async (_, { getState }) => {
    const refresh = getState().auth.refreshToken;
    if (refresh) await AuthService.logout(refresh);
  }
);

export const verifyTwoFactorAction = createAsyncThunk<
  ServiceResult<SignedIn>,
  { challengeId: string; code: string },
  { state: RootState }
>(AUTH_REDUCER + '/verifyTwoFactor', async ({ challengeId, code }) =>
  AuthService.verifyTwoFactor(challengeId, code)
);

export const resendTwoFactorAction = createAsyncThunk<
  ServiceResult<TwoFactorRequired>,
  { challengeId: string },
  { state: RootState }
>(AUTH_REDUCER + '/resendTwoFactor', async ({ challengeId }) =>
  AuthService.resendTwoFactor(challengeId)
);
