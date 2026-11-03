import { combineReducers, type Reducer } from '@reduxjs/toolkit';

import authReducer from '@/domain/auth/store/AuthReducer';
import notesReducer from '@/domain/notes/store/NotesReducer';
import visitsReducer from '@/domain/visits/store/VisitsReducer';
import ToastReducer from '@/store/common-reducer/ToastReducer';
import type { AppState } from '@/store/interfaces/AppState';

export const rootReducer: Reducer<AppState> = combineReducers({
  auth: authReducer,
  notes: notesReducer,
  toast: ToastReducer,
  visits: visitsReducer,
});
