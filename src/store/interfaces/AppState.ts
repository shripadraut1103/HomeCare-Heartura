import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import type { NotesState } from '@/domain/notes/store/NotesReducer';
import type { VisitsState } from '@/domain/visits/store/VisitsReducer';
import type { ToastState } from '@/store/common-reducer/ToastReducer';

export interface AppState {
  auth: AuthState;
  notes: NotesState;
  toast: ToastState;
  visits: VisitsState;
}
