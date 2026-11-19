import { callApi } from '@/config/ApiError';
import { get, patch, post } from '@/config/AxiosConfig';
import type {
  ApiAppointmentCreate,
  ApiAppointmentReschedule,
  ApiAppointmentUpdate,
  ApiBookablePatient,
  ApiBookingCheckRequest,
  ApiBookingCheckResult,
  ApiPage,
  ApiPatientOption,
  ApiSchedulingReference,
} from '@/domain/schedule/interfaces/BookingApi';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const VISIT_ENDPOINTS = {
  appointments: '/api/scheduling/appointments/',
  appointment: (id: string) => `/api/scheduling/appointments/${id}/`,
  status: (id: string) => `/api/scheduling/appointments/${id}/status/`,
  reschedule: (id: string) => `/api/scheduling/appointments/${id}/reschedule/`,
  check: '/api/scheduling/appointments/check/',
  reference: '/api/scheduling/appointments/reference/',
  patients: '/api/scheduling/patients/',
  bookingPlan: (id: string) => `/api/scheduling/patients/${id}/booking-plan/`,
} as const;

export const PATIENT_SEARCH_PAGE_SIZE = 20;

export type ApiVisitStatusChange = {
  status: 'scheduled' | 'cancelled' | 'no_show';
  version: number;
  note?: string;
};

export type DateRange = { from: string; to: string };

export function appointmentList(data: unknown): ApiAppointment[] {
  if (Array.isArray(data)) return data as ApiAppointment[];
  if (data && typeof data === 'object' && 'id' in data) return [data as ApiAppointment];
  const results = (data as { results?: unknown } | null)?.results;
  return Array.isArray(results) ? (results as ApiAppointment[]) : [];
}

class VisitService {
  async getAppointments(range: DateRange): Promise<ServiceResult<ApiAppointment[]>> {
    return callApi(async () =>
      appointmentList(
        await get<unknown>(VISIT_ENDPOINTS.appointments, {
          params: { from: range.from, to: range.to },
        })
      )
    );
  }

  async getAppointment(id: string): Promise<ServiceResult<ApiAppointment>> {
    return callApi(() => get<ApiAppointment>(VISIT_ENDPOINTS.appointment(id)));
  }

  async changeStatus(
    id: string,
    body: ApiVisitStatusChange
  ): Promise<ServiceResult<ApiAppointment>> {
    return callApi(() => post<ApiAppointment>(VISIT_ENDPOINTS.status(id), body));
  }

  async getReference(): Promise<ServiceResult<ApiSchedulingReference>> {
    return callApi(() => get<ApiSchedulingReference>(VISIT_ENDPOINTS.reference));
  }

  async searchPatients(search: string): Promise<ServiceResult<ApiPage<ApiPatientOption>>> {
    return callApi(() =>
      get<ApiPage<ApiPatientOption>>(VISIT_ENDPOINTS.patients, {
        params: { search: search || undefined, page: 1, page_size: PATIENT_SEARCH_PAGE_SIZE },
      })
    );
  }

  async getBookingPlan(patientId: string): Promise<ServiceResult<ApiBookablePatient>> {
    return callApi(() => get<ApiBookablePatient>(VISIT_ENDPOINTS.bookingPlan(patientId)));
  }

  async checkBooking(body: ApiBookingCheckRequest): Promise<ServiceResult<ApiBookingCheckResult>> {
    return callApi(() => post<ApiBookingCheckResult>(VISIT_ENDPOINTS.check, body));
  }

  async createAppointments(body: ApiAppointmentCreate): Promise<ServiceResult<ApiAppointment[]>> {
    return callApi(async () =>
      appointmentList(await post<unknown>(VISIT_ENDPOINTS.appointments, body))
    );
  }

  async updateAppointment(
    id: string,
    body: ApiAppointmentUpdate
  ): Promise<ServiceResult<ApiAppointment>> {
    return callApi(() => patch<ApiAppointment>(VISIT_ENDPOINTS.appointment(id), body));
  }

  async rescheduleAppointment(
    id: string,
    body: ApiAppointmentReschedule
  ): Promise<ServiceResult<ApiAppointment>> {
    return callApi(() => post<ApiAppointment>(VISIT_ENDPOINTS.reschedule(id), body));
  }
}

export default new VisitService();
