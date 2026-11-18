import { callApi } from '@/config/ApiError';
import { get } from '@/config/AxiosConfig';
import type { ApiPage, ApiPatient } from '@/domain/patients/interfaces/PatientApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const PATIENT_ENDPOINTS = {
  patients: '/api/patients/',
  patient: (id: string) => `/api/patients/${id}/`,
} as const;

export const PATIENTS_PAGE_SIZE = 25;

export type PatientListQuery = { search: string; status?: string; page: number };

class PatientService {
  async getPatients(query: PatientListQuery): Promise<ServiceResult<ApiPage<ApiPatient>>> {
    return callApi(() =>
      get<ApiPage<ApiPatient>>(PATIENT_ENDPOINTS.patients, {
        params: {
          page: query.page,
          page_size: PATIENTS_PAGE_SIZE,
          ...(query.search.trim() ? { search: query.search.trim() } : {}),
          ...(query.status ? { status: query.status } : {}),
        },
      })
    );
  }

  async getPatient(id: string): Promise<ServiceResult<ApiPatient>> {
    return callApi(() => get<ApiPatient>(PATIENT_ENDPOINTS.patient(id)));
  }
}

export default new PatientService();
