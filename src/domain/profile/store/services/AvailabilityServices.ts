import { callApi } from '@/config/ApiError';
import { del, get, patch, post, put } from '@/config/AxiosConfig';
import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import type {
  ApiAvailabilityProvider,
  ApiBlockDay,
  ApiBlockDayWrite,
  ApiWeeklyHours,
  ApiWeeklyHoursUpdate,
} from '@/domain/profile/interfaces/AvailabilityApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const AVAILABILITY_ENDPOINTS = {
  providers: '/api/availability/providers/',
  weeklyHours: (providerId: string) => `/api/availability/providers/${providerId}/`,
  blockDays: '/api/block-days/',
  blockDay: (id: string) => `/api/block-days/${id}/`,
  restoreBlockDay: (id: string) => `/api/block-days/${id}/restore/`,
} as const;

const LIST_PAGE_SIZE = 100;

class AvailabilityService {
  async getProviders(): Promise<ServiceResult<ApiPage<ApiAvailabilityProvider>>> {
    return callApi(() =>
      get<ApiPage<ApiAvailabilityProvider>>(AVAILABILITY_ENDPOINTS.providers, {
        params: { page_size: LIST_PAGE_SIZE },
      })
    );
  }

  async getWeeklyHours(providerId: string): Promise<ServiceResult<ApiWeeklyHours>> {
    return callApi(() => get<ApiWeeklyHours>(AVAILABILITY_ENDPOINTS.weeklyHours(providerId)));
  }

  async saveWeeklyHours(
    providerId: string,
    body: ApiWeeklyHoursUpdate
  ): Promise<ServiceResult<ApiWeeklyHours>> {
    return callApi(() => put<ApiWeeklyHours>(AVAILABILITY_ENDPOINTS.weeklyHours(providerId), body));
  }

  async getBlockDays(
    providerId: string,
    from: string
  ): Promise<ServiceResult<ApiPage<ApiBlockDay>>> {
    return callApi(() =>
      get<ApiPage<ApiBlockDay>>(AVAILABILITY_ENDPOINTS.blockDays, {
        params: {
          provider: providerId,
          from,
          ordering: 'start_date',
          page_size: LIST_PAGE_SIZE,
        },
      })
    );
  }

  async createBlockDay(body: ApiBlockDayWrite): Promise<ServiceResult<ApiBlockDay>> {
    return callApi(() => post<ApiBlockDay>(AVAILABILITY_ENDPOINTS.blockDays, body));
  }

  async updateBlockDay(
    id: string,
    body: ApiBlockDayWrite & { version: number }
  ): Promise<ServiceResult<ApiBlockDay>> {
    return callApi(() => patch<ApiBlockDay>(AVAILABILITY_ENDPOINTS.blockDay(id), body));
  }

  async deleteBlockDay(id: string, version: number): Promise<ServiceResult<void>> {
    return callApi(() => del<void>(AVAILABILITY_ENDPOINTS.blockDay(id), { params: { version } }));
  }

  async restoreBlockDay(id: string): Promise<ServiceResult<void>> {
    return callApi(() => post<void>(AVAILABILITY_ENDPOINTS.restoreBlockDay(id)));
  }
}

export default new AvailabilityService();
