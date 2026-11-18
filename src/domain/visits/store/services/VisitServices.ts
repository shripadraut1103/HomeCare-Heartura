import { callApi } from '@/config/ApiError';
import { get } from '@/config/AxiosConfig';
import type { ApiAppointment } from '@/domain/visits/interfaces/AppointmentApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const VISIT_ENDPOINTS = {
  appointments: '/api/scheduling/appointments/',
} as const;

export type DateRange = { from: string; to: string };

export function appointmentList(data: unknown): ApiAppointment[] {
  if (Array.isArray(data)) return data as ApiAppointment[];
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
}

export default new VisitService();
