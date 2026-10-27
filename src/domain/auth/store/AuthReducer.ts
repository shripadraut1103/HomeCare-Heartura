import { createSlice } from '@reduxjs/toolkit';

import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import { loginAction } from '@/domain/auth/store/async-actions/AuthAsyncActions';
import { AUTH_REDUCER } from '@/store/constants/StoreConstants';

const initialState: AuthState = {
  isLoggedIn: false,
  loading: false,
  accessToken: null,
  refreshToken: null,
};

const AuthReducer = createSlice({
  name: AUTH_REDUCER,
  initialState,
  reducers: {
    resetAuthReducer: (state) => {
      state.isLoggedIn = false;
      state.loading = false;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.loading = false;
        // Services never throw, so a failed login also lands here.
        if ('error' in action.payload) return;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        state.isLoggedIn = true;
      })
      .addCase(loginAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default AuthReducer.reducer;
export const { resetAuthReducer } = AuthReducer.actions;
