import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import type {
  AppNotification,
  NotificationCategory,
} from '@/domain/notifications/interfaces/NotificationInterfaces';
import { listKey } from '@/domain/notifications/notificationMapper';
import {
  fetchNotificationDaysAction,
  fetchNotificationsAction,
  fetchUnreadCountAction,
  markNotificationsReadAction,
} from '@/domain/notifications/store/async-actions/NotificationAsyncActions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const UNREAD_POLL_MS = 60_000;

export function useUnreadNotifications() {
  const dispatch = useAppDispatch();
  const unread = useAppSelector((state) => state.notifications.unread);

  useFocusEffect(
    useCallback(() => {
      const refresh = () => void dispatch(fetchUnreadCountAction());
      refresh();
      const timer = setInterval(refresh, UNREAD_POLL_MS);
      return () => clearInterval(timer);
    }, [dispatch])
  );

  return unread;
}

export function useNotificationDays() {
  const dispatch = useAppDispatch();
  const days = useAppSelector((state) => state.notifications.days);
  const loading = useAppSelector((state) => state.notifications.daysLoading);
  const loaded = useAppSelector((state) => state.notifications.daysLoaded);
  const error = useAppSelector((state) => state.notifications.daysError);
  const reload = useCallback(() => {
    void dispatch(fetchNotificationDaysAction());
    void dispatch(fetchUnreadCountAction());
  }, [dispatch]);
  return { days, loading, loaded, error, reload };
}

const NO_IDS: readonly string[] = [];

export function useNotificationList(date: string | undefined, category: NotificationCategory) {
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) =>
    date ? state.notifications.lists[listKey(date, category)] : undefined
  );
  const byId = useAppSelector((state) => state.notifications.byId);
  const ids = list?.ids ?? NO_IDS;
  const notifications = ids
    .map((id) => byId[id])
    .filter((item): item is AppNotification => item !== undefined);

  const reload = useCallback(() => {
    if (date) void dispatch(fetchNotificationsAction({ date, category }));
  }, [dispatch, date, category]);

  return {
    notifications,
    loading: list?.loading ?? false,
    loaded: list?.loaded ?? false,
    error: list?.error ?? null,
    reload,
  };
}

export function useMarkNotificationsRead() {
  const dispatch = useAppDispatch();
  return useCallback(
    (ids?: string[]) => {
      if (ids && ids.length === 0) return;
      void dispatch(markNotificationsReadAction({ ids })).then(() => {
        void dispatch(fetchUnreadCountAction());
      });
    },
    [dispatch]
  );
}
