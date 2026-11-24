import { callApi } from '@/config/ApiError';
import { get, post } from '@/config/AxiosConfig';
import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import type {
  ApiMarkRead,
  ApiNotification,
  ApiNotificationCategory,
  ApiNotificationDay,
  ApiPushPlatform,
  ApiUnreadCount,
} from '@/domain/notifications/interfaces/NotificationApi';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const NOTIFICATION_ENDPOINTS = {
  list: '/api/notifications/',
  days: '/api/notifications/days/',
  read: '/api/notifications/read/',
  unreadCount: '/api/notifications/unread-count/',
  devices: '/api/notifications/devices/',
  unregisterDevice: '/api/notifications/devices/unregister/',
} as const;

const PAGE_SIZE = 100;

class NotificationService {
  async getNotifications(
    date: string,
    category: ApiNotificationCategory
  ): Promise<ServiceResult<ApiPage<ApiNotification>>> {
    return callApi(() =>
      get<ApiPage<ApiNotification>>(NOTIFICATION_ENDPOINTS.list, {
        params: { date, category, page_size: PAGE_SIZE },
      })
    );
  }

  async getDays(): Promise<ServiceResult<ApiNotificationDay[]>> {
    return callApi(() => get<ApiNotificationDay[]>(NOTIFICATION_ENDPOINTS.days));
  }

  async getUnreadCount(): Promise<ServiceResult<ApiUnreadCount>> {
    return callApi(() => get<ApiUnreadCount>(NOTIFICATION_ENDPOINTS.unreadCount));
  }

  async markRead(ids?: string[]): Promise<ServiceResult<ApiMarkRead>> {
    return callApi(() => post<ApiMarkRead>(NOTIFICATION_ENDPOINTS.read, ids ? { ids } : {}));
  }

  async registerDevice(fid: string, platform: ApiPushPlatform): Promise<ServiceResult<unknown>> {
    return callApi(() => post<unknown>(NOTIFICATION_ENDPOINTS.devices, { fid, platform }));
  }

  async unregisterDevice(fid: string): Promise<ServiceResult<unknown>> {
    return callApi(() => post<unknown>(NOTIFICATION_ENDPOINTS.unregisterDevice, { fid }));
  }
}

export default new NotificationService();
