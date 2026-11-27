import { callApi } from '@/config/ApiError';
import { get } from '@/config/AxiosConfig';
import type { ApiActivity, ApiActivityQuery, ApiVisitLog } from '@/domain/logs/interfaces/LogApi';
import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const LOG_ENDPOINTS = {
  activity: '/api/activity/mine/',
  visitLog: '/api/scheduling/my-visit-log/',
} as const;

class LogService {
  async getActivity(query: ApiActivityQuery): Promise<ServiceResult<ApiPage<ApiActivity>>> {
    return callApi(() => get<ApiPage<ApiActivity>>(LOG_ENDPOINTS.activity, { params: query }));
  }

  async getVisitLog(dateFrom: string, dateTo: string): Promise<ServiceResult<ApiVisitLog>> {
    return callApi(() =>
      get<ApiVisitLog>(LOG_ENDPOINTS.visitLog, {
        params: { date_from: dateFrom, date_to: dateTo },
      })
    );
  }
}

export default new LogService();
