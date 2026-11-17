import { combineReducers, type Reducer } from '@reduxjs/toolkit';
import { persistReducer, type PersistConfig } from 'redux-persist';

import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import authReducer from '@/domain/auth/store/AuthReducer';
import communicationsReducer from '@/domain/communications/store/CommunicationsReducer';
import notesReducer from '@/domain/notes/store/NotesReducer';
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
  whitelist: ['isLoggedIn', 'accessToken', 'refreshToken', 'accessExpiresAt', 'refreshExpiresAt'],
};

export const rootReducer: Reducer<AppState> = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  availability: availabilityReducer,
  blockDays: blockDaysReducer,
  communications: communicationsReducer,
  notes: notesReducer,
  patients: patientsReducer,
  preferences: preferencesReducer,
  profile: profileReducer,
  requests: requestsReducer,
  toast: ToastReducer,
  visits: visitsReducer,
});
