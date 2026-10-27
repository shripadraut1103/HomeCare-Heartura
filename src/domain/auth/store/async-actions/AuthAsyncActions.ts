import { createAsyncThunk } from '@reduxjs/toolkit';

import type { LoginFormValues } from '@/domain/auth/schemas/loginSchema';
import AuthService from '@/domain/auth/store/services/AuthServices';
import type { LoginResponse } from '@/domain/auth/interfaces/AuthInterfaces';
import type { ServiceResult } from '@/types/ServiceInterfaces';
import { AUTH_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';

export const loginAction = createAsyncThunk<
  ServiceResult<LoginResponse>,
  LoginFormValues,
  { state: RootState }
>(AUTH_REDUCER + '/login', async (data) => AuthService.login(data));
