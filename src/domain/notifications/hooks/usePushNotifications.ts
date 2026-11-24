import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { targetFromUrl } from '@/domain/notifications/notificationTargets';
import {
  PUSH_SUPPORTED,
  pushPayloadUrl,
  registerPushToken,
  showPushWhileOpen,
} from '@/domain/notifications/pushNotifications';
import { fetchUnreadCountAction } from '@/domain/notifications/store/async-actions/NotificationAsyncActions';
import { useAppDispatch } from '@/store/hooks';

export function usePushNotifications() {
  const dispatch = useAppDispatch();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!PUSH_SUPPORTED) return;
    showPushWhileOpen();
    void registerPushToken();
    const tokenChanged = Notifications.addPushTokenListener((token) => {
      if (typeof token.data === 'string') void registerPushToken(token.data);
    });
    const received = Notifications.addNotificationReceivedListener(() => {
      void dispatch(fetchUnreadCountAction());
    });
    return () => {
      tokenChanged.remove();
      received.remove();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!lastResponse) return;
    if (lastResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = lastResponse.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    void Notifications.clearLastNotificationResponseAsync();
    void dispatch(fetchUnreadCountAction());
    const target = targetFromUrl(pushPayloadUrl(lastResponse));
    if (target?.type === 'screen') router.push(target.href);
    else if (target?.type === 'visit') router.navigate('/schedule');
    else router.navigate('/');
  }, [dispatch, lastResponse]);
}
