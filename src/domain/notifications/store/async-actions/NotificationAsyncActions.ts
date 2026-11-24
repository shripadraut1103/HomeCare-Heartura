import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  ApiMarkRead,
  ApiNotification,
  ApiNotificationDay,
  ApiUnreadCount,
} from '@/domain/notifications/interfaces/NotificationApi';
import type { NotificationCategory } from '@/domain/notifications/interfaces/NotificationInterfaces';
import { listKey } from '@/domain/notifications/notificationMapper';
import NotificationService from '@/domain/notifications/store/services/NotificationServices';
import type { ApiPage } from '@/domain/patients/interfaces/PatientApi';
import { NOTIFICATIONS_REDUCER } from '@/store/constants/StoreConstants';
import type { RootState } from '@/store/storeConfig';
import type { ServiceResult } from '@/types/ServiceInterfaces';

export const fetchNotificationsAction = createAsyncThunk<
  ServiceResult<ApiPage<ApiNotification>>,
  { date: string; category: NotificationCategory },
  { state: RootState }
>(
  NOTIFICATIONS_REDUCER + '/fetch',
  async ({ date, category }) => NotificationService.getNotifications(date, category),
  {
    condition: ({ date, category }, { getState }) =>
      !getState().notifications.lists[listKey(date, category)]?.loading,
  }
);

export const fetchNotificationDaysAction = createAsyncThunk<
  ServiceResult<ApiNotificationDay[]>,
  void,
  { state: RootState }
>(NOTIFICATIONS_REDUCER + '/fetchDays', async () => NotificationService.getDays(), {
  condition: (_, { getState }) => !getState().notifications.daysLoading,
});

export const fetchUnreadCountAction = createAsyncThunk<
  ServiceResult<ApiUnreadCount>,
  void,
  { state: RootState }
>(NOTIFICATIONS_REDUCER + '/fetchUnreadCount', async () => NotificationService.getUnreadCount());

export const markNotificationsReadAction = createAsyncThunk<
  ServiceResult<ApiMarkRead>,
  { ids?: string[] },
  { state: RootState }
>(NOTIFICATIONS_REDUCER + '/markRead', async ({ ids }) => NotificationService.markRead(ids));
