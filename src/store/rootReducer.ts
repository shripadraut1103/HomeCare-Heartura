import { combineReducers, type Reducer } from '@reduxjs/toolkit';
import { persistReducer, type PersistConfig } from 'redux-persist';

import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import authReducer, { sessionExpired } from '@/domain/auth/store/AuthReducer';
import { logoutAction } from '@/domain/auth/store/async-actions/AuthAsyncActions';
import communicationsReducer from '@/domain/communications/store/CommunicationsReducer';
import logsReducer from '@/domain/logs/store/LogsReducer';
import notesReducer from '@/domain/notes/store/NotesReducer';
import notificationsReducer from '@/domain/notifications/store/NotificationsReducer';
import patientsReducer from '@/domain/patients/store/PatientsReducer';
import availabilityReducer from '@/domain/profile/store/AvailabilityReducer';
import blockDaysReducer from '@/domain/profile/store/BlockDaysReducer';
import preferencesReducer from '@/domain/profile/store/PreferencesReducer';
import profileReducer from '@/domain/profile/store/ProfileReducer';
import requestsReducer from '@/domain/requests/store/RequestsReducer';
import visitsReducer from '@/domain/visits/store/VisitsReducer';
import ToastReducer from '@/store/common-reducer/ToastReducer';
import { AUTH_REDUCER } from '@/store/constants/StoreConstants';
import type { AppState } from '@/store/interfaces/AppState';
import { secureStorage } from '@/store/secureStorage';

const authPersistConfig: PersistConfig<AuthState> = {
  key: AUTH_REDUCER,
  version: 1,
  storage: secureStorage,
  whitelist: [
    'isLoggedIn',
    'lockScreenUser',
    'accessToken',
    'refreshToken',
    'accessExpiresAt',
    'refreshExpiresAt',
  ],
};

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  availability: availabilityReducer,
  blockDays: blockDaysReducer,
  communications: communicationsReducer,
  logs: logsReducer,
  notes: notesReducer,
  notifications: notificationsReducer,
  patients: patientsReducer,
  preferences: preferencesReducer,
  profile: profileReducer,
  requests: requestsReducer,
  toast: ToastReducer,
  visits: visitsReducer,
});

export const rootReducer: Reducer<AppState> = (state, action) =>
  appReducer(
    state && (logoutAction.fulfilled.match(action) || sessionExpired.match(action))
      ? { auth: state.auth, preferences: state.preferences, toast: state.toast }
      : state,
    action
  );
