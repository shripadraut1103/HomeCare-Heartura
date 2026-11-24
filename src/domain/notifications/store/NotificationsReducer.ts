import { createSlice } from '@reduxjs/toolkit';

import type {
  NotificationCategory,
  NotificationsState,
} from '@/domain/notifications/interfaces/NotificationInterfaces';
import {
  emptyUnreadByCategory,
  isCategory,
  listKey,
  toAppNotification,
} from '@/domain/notifications/notificationMapper';
import {
  fetchNotificationDaysAction,
  fetchNotificationsAction,
  fetchUnreadCountAction,
  markNotificationsReadAction,
} from '@/domain/notifications/store/async-actions/NotificationAsyncActions';
import { NOTIFICATIONS_REDUCER } from '@/store/constants/StoreConstants';
import { toIsoDate } from '@/utils/dateFormat';

const initialState: NotificationsState = {
  byId: {},
  lists: {},
  days: [],
  daysLoading: false,
  daysLoaded: false,
  daysError: null,
  unread: { total: 0, byCategory: emptyUnreadByCategory() },
};

const emptyList = () => ({ ids: [], loading: false, loaded: false, error: null });

function markRead(state: NotificationsState, ids: readonly string[] | undefined) {
  const targets = ids ?? Object.keys(state.byId);
  for (const id of targets) {
    const notification = state.byId[id];
    if (!notification || notification.read) continue;
    notification.read = true;
    const category = notification.category;
    state.unread.byCategory[category] = Math.max(0, state.unread.byCategory[category] - 1);
    state.unread.total = Math.max(0, state.unread.total - 1);
    const day = state.days.find(
      (item) => item.date === toIsoDate(new Date(notification.createdAt))
    );
    if (day) day.unread = Math.max(0, day.unread - 1);
  }
  if (!ids) {
    state.unread = { total: 0, byCategory: emptyUnreadByCategory() };
    for (const day of state.days) day.unread = 0;
  }
}

const NotificationsReducer = createSlice({
  name: NOTIFICATIONS_REDUCER,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsAction.pending, (state, action) => {
        const key = listKey(action.meta.arg.date, action.meta.arg.category);
        const list = (state.lists[key] ??= emptyList());
        list.loading = true;
        list.error = null;
      })
      .addCase(fetchNotificationsAction.fulfilled, (state, action) => {
        const key = listKey(action.meta.arg.date, action.meta.arg.category);
        const list = (state.lists[key] ??= emptyList());
        list.loading = false;
        if ('error' in action.payload) {
          list.error = action.payload.error;
          return;
        }
        const notifications = action.payload.data.results.map(toAppNotification);
        for (const notification of notifications) state.byId[notification.id] = notification;
        list.ids = notifications.map((notification) => notification.id);
        list.loaded = true;
      })
      .addCase(fetchNotificationsAction.rejected, (state, action) => {
        const key = listKey(action.meta.arg.date, action.meta.arg.category);
        const list = (state.lists[key] ??= emptyList());
        list.loading = false;
        list.error = 'Couldn’t load notifications.';
      })
      .addCase(fetchNotificationDaysAction.pending, (state) => {
        state.daysLoading = true;
        state.daysError = null;
      })
      .addCase(fetchNotificationDaysAction.fulfilled, (state, action) => {
        state.daysLoading = false;
        if ('error' in action.payload) {
          state.daysError = action.payload.error;
          return;
        }
        state.days = action.payload.data;
        state.daysLoaded = true;
      })
      .addCase(fetchNotificationDaysAction.rejected, (state) => {
        state.daysLoading = false;
        state.daysError = 'Couldn’t load notifications.';
      })
      .addCase(fetchUnreadCountAction.fulfilled, (state, action) => {
        if ('error' in action.payload) return;
        const byCategory = emptyUnreadByCategory();
        for (const [category, count] of Object.entries(action.payload.data.by_category)) {
          if (isCategory(category)) byCategory[category as NotificationCategory] = count;
        }
        state.unread = { total: action.payload.data.count, byCategory };
      })
      .addCase(markNotificationsReadAction.pending, (state, action) => {
        markRead(state, action.meta.arg.ids);
      });
  },
});

export default NotificationsReducer.reducer;
