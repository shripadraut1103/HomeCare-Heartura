import { callApi } from '@/config/ApiError';
import { get, post } from '@/config/AxiosConfig';
import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import type {
  ApiDeclineBody,
  ApiPatientRequest,
  ApiRequestCounts,
  ApiRequestStatusFilter,
} from '@/domain/requests/interfaces/RequestApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const REQUEST_ENDPOINTS = {
  requests: '/api/patient-requests/',
  counts: '/api/patient-requests/counts/',
  accept: (id: string) => `/api/patient-requests/${id}/accept/`,
  decline: (id: string) => `/api/patient-requests/${id}/decline/`,
} as const;

export const REQUESTS_PAGE_SIZE = 20;

class RequestService {
  async getRequests(
    status: ApiRequestStatusFilter,
    page: number
  ): Promise<ServiceResult<ApiPage<ApiPatientRequest>>> {
    return callApi(() =>
      get<ApiPage<ApiPatientRequest>>(REQUEST_ENDPOINTS.requests, {
        params: { status, page, page_size: REQUESTS_PAGE_SIZE },
      })
    );
  }

  async getCounts(): Promise<ServiceResult<ApiRequestCounts>> {
    return callApi(() => get<ApiRequestCounts>(REQUEST_ENDPOINTS.counts));
  }

  async accept(id: string): Promise<ServiceResult<ApiPatientRequest>> {
    return callApi(() => post<ApiPatientRequest>(REQUEST_ENDPOINTS.accept(id)));
  }

  async decline(id: string, body: ApiDeclineBody): Promise<ServiceResult<ApiPatientRequest>> {
    return callApi(() => post<ApiPatientRequest>(REQUEST_ENDPOINTS.decline(id), body));
  }
}

export default new RequestService();
