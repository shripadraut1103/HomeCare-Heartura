import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthState, AuthTokens, SignedIn } from '@/domain/auth/interfaces/AuthInterfaces';
import {
  fetchMeAction,
  loginAction,
  logoutAction,
  resendTwoFactorAction,
  verifyTwoFactorAction,
} from '@/domain/auth/store/async-actions/AuthAsyncActions';
import { AUTH_REDUCER } from '@/store/constants/StoreConstants';

const initialState: AuthState = {
  isLoggedIn: false,
  loading: false,
  accessToken: null,
  refreshToken: null,
  accessExpiresAt: null,
  refreshExpiresAt: null,
  me: null,
  challenge: null,
};

const saveTokens = (state: AuthState, tokens: AuthTokens) => {
  state.accessToken = tokens.access;
  state.refreshToken = tokens.refresh;
  state.accessExpiresAt = tokens.access_expires_at;
  state.refreshExpiresAt = tokens.refresh_expires_at;
};

const startSession = (state: AuthState, { tokens, me }: SignedIn) => {
  saveTokens(state, tokens);
  state.me = me;
  state.challenge = null;
  state.isLoggedIn = true;
};

const AuthReducer = createSlice({
  name: AUTH_REDUCER,
  initialState,
  reducers: {
    resetAuthReducer: () => initialState,
    tokensRefreshed: (state, action: PayloadAction<AuthTokens>) => {
      saveTokens(state, action.payload);
    },
    sessionExpired: () => initialState,
    clearChallenge: (state) => {
      state.challenge = null;
    },
    lockSession: (state) => {
      state.isLoggedIn = false;
    },
    unlockSession: (state) => {
      state.isLoggedIn = state.refreshToken !== null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAction.pending, (state) => {
        state.loading = true;
        state.challenge = null;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.loading = false;
        // Services never throw, so a failed login also lands here.
        if ('error' in action.payload) return;
        const response = action.payload.data;
        if (response.two_factor_required) {
          state.challenge = {
            id: response.challenge_id,
            expiresAt: response.challenge_expires_at,
            email: action.meta.arg.email.trim(),
          };
          return;
        }
        startSession(state, response);
      })
      .addCase(loginAction.rejected, (state) => {
        state.loading = false;
      })
      .addCase(verifyTwoFactorAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyTwoFactorAction.fulfilled, (state, action) => {
        state.loading = false;
        if ('data' in action.payload) startSession(state, action.payload.data);
      })
      .addCase(verifyTwoFactorAction.rejected, (state) => {
        state.loading = false;
      })
      .addCase(resendTwoFactorAction.fulfilled, (state, action) => {
        if (!('data' in action.payload) || !state.challenge) return;
        state.challenge.id = action.payload.data.challenge_id;
        state.challenge.expiresAt = action.payload.data.challenge_expires_at;
      })
      .addCase(fetchMeAction.fulfilled, (state, action) => {
        if ('data' in action.payload) state.me = action.payload.data;
      })
      .addCase(logoutAction.fulfilled, () => initialState)
      .addCase(logoutAction.rejected, () => initialState);
  },
});

export default AuthReducer.reducer;
export const {
  resetAuthReducer,
  clearChallenge,
  tokensRefreshed,
  sessionExpired,
  lockSession,
  unlockSession,
} = AuthReducer.actions;
