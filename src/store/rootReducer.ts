import { combineReducers, type Reducer } from '@reduxjs/toolkit';

import authReducer from '@/domain/auth/store/AuthReducer';
import visitsReducer from '@/domain/visits/store/VisitsReducer';
import ToastReducer from '@/store/common-reducer/ToastReducer';
import type { AppState } from '@/store/interfaces/AppState';

export const rootReducer: Reducer<AppState> = combineReducers({
  auth: authReducer,
  toast: ToastReducer,
  visits: visitsReducer,
});
