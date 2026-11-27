import type { PersistPartial } from 'redux-persist/es/persistReducer';
import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import type { CommunicationsState } from '@/domain/communications/interfaces/CommunicationInterfaces';
import type { LogsState } from '@/domain/logs/interfaces/LogInterfaces';
import type { NotesState } from '@/domain/notes/store/NotesReducer';
import type { NotificationsState } from '@/domain/notifications/interfaces/NotificationInterfaces';
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
  auth: AuthState & PersistPartial;
  availability: AvailabilityState;
  blockDays: BlockDaysState;
  communications: CommunicationsState;
  logs: LogsState;
  notes: NotesState;
  notifications: NotificationsState;
  patients: PatientsState;
  preferences: PreferencesState;
  profile: ProfileState;
  requests: RequestsState;
  toast: ToastState;
  visits: VisitsState;
}
