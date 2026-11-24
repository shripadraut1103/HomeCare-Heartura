import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import NotificationService from '@/domain/notifications/store/services/NotificationServices';

// TODO: enable iOS once the APNs key is uploaded to Firebase and iOS gets an FCM token.
export const PUSH_SUPPORTED = Platform.OS === 'android';

const CHANNEL_ID = 'default';

let registeredToken: string | null = null;

export function showPushWhileOpen() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function getPushToken(): Promise<string | null> {
  if (!PUSH_SUPPORTED) return null;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Notifications',
      importance: AndroidImportance.HIGH,
    });
    const current = await Notifications.getPermissionsAsync();
    const granted =
      current.granted ||
      (current.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
    if (!granted) return null;
    const token = await Notifications.getDevicePushTokenAsync();
    return typeof token.data === 'string' ? token.data : null;
  } catch {
    return null;
  }
}

export async function registerPushToken(token?: string) {
  const fid = token ?? (await getPushToken());
  if (!fid) return;
  // TEMPORARY: dev-only, to send test pushes from the Firebase console.
  if (__DEV__) console.log(`FCM token: ${fid}`);
  const result = await NotificationService.registerDevice(
    fid,
    Platform.OS === 'ios' ? 'ios' : 'android'
  );
  if (!('error' in result)) registeredToken = fid;
}

export async function unregisterPushToken() {
  const fid = registeredToken;
  if (!fid) return;
  registeredToken = null;
  await NotificationService.unregisterDevice(fid);
}

export function pushPayloadUrl(response: Notifications.NotificationResponse): string | undefined {
  const { content, trigger } = response.notification.request;
  const fromContent = content.data?.url;
  if (typeof fromContent === 'string') return fromContent;
  const remote = (trigger as { remoteMessage?: { data?: Record<string, string> } } | null)
    ?.remoteMessage?.data?.url;
  return typeof remote === 'string' ? remote : undefined;
}
