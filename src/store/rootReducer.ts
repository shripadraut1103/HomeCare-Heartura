import { combineReducers, type Reducer } from '@reduxjs/toolkit';

import authReducer from '@/domain/auth/store/AuthReducer';
import communicationsReducer from '@/domain/communications/store/CommunicationsReducer';
import notesReducer from '@/domain/notes/store/NotesReducer';
import availabilityReducer from '@/domain/profile/store/AvailabilityReducer';
import blockDaysReducer from '@/domain/profile/store/BlockDaysReducer';
import preferencesReducer from '@/domain/profile/store/PreferencesReducer';
import profileReducer from '@/domain/profile/store/ProfileReducer';
import requestsReducer from '@/domain/requests/store/RequestsReducer';
import visitsReducer from '@/domain/visits/store/VisitsReducer';
import ToastReducer from '@/store/common-reducer/ToastReducer';
import type { AppState } from '@/store/interfaces/AppState';

export const rootReducer: Reducer<AppState> = combineReducers({
  auth: authReducer,
  availability: availabilityReducer,
  blockDays: blockDaysReducer,
  communications: communicationsReducer,
  notes: notesReducer,
  preferences: preferencesReducer,
  profile: profileReducer,
  requests: requestsReducer,
  toast: ToastReducer,
  visits: visitsReducer,
});
