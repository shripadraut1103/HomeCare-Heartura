import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import type { CommunicationsState } from '@/domain/communications/interfaces/CommunicationInterfaces';
import type { NotesState } from '@/domain/notes/store/NotesReducer';
import type { PatientsState } from '@/domain/patients/interfaces/PatientInterfaces';
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
  communications: CommunicationsState;
  notes: NotesState;
  patients: PatientsState;
  preferences: PreferencesState;
  profile: ProfileState;
  requests: RequestsState;
  toast: ToastState;
  visits: VisitsState;
}
