import type { AuthState } from '@/domain/auth/interfaces/AuthInterfaces';
import type { VisitsState } from '@/domain/visits/store/VisitsReducer';
import type { ToastState } from '@/store/common-reducer/ToastReducer';

/** Add a key here every time a slice is added to `rootReducer`. */
export interface AppState {
  auth: AuthState;
  toast: ToastState;
  visits: VisitsState;
}
