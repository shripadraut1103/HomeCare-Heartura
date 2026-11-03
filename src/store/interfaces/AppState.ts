import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import type { NotesState } from '@/domain/notes/store/NotesReducer';
import type {
  AvailabilityState,
  BlockDaysState,
  PreferencesState,
  ProfileState,
} from '@/domain/profile/interfaces/ProfileInterfaces';
import type { RequestsState } from '@/domain/requests/interfaces/RequestInterfaces';
import type { VisitsState } from '@/domain/visits/store/VisitsReducer';
import type { ToastState } from '@/store/common-reducer/ToastReducer';

export interface AppState {
  auth: AuthState;
  availability: AvailabilityState;
  blockDays: BlockDaysState;
  notes: NotesState;
  preferences: PreferencesState;
  profile: ProfileState;
  requests: RequestsState;
  toast: ToastState;
  visits: VisitsState;
}
