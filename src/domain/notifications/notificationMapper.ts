import type { ApiNotification } from '@/domain/notifications/interfaces/NotificationApi';
import type {
  AppNotification,
  NotificationCategory,
} from '@/domain/notifications/interfaces/NotificationInterfaces';

export const NOTIFICATION_CATEGORIES: readonly NotificationCategory[] = ['plans', 'office', 'evv'];

export const isCategory = (value: string): value is NotificationCategory =>
  (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);

export const listKey = (date: string, category: NotificationCategory) => `${date}|${category}`;

export const toAppNotification = (notification: ApiNotification): AppNotification => ({
  id: notification.id,
  kind: notification.kind,
  category: isCategory(notification.category) ? notification.category : 'office',
  level: notification.level === 'attention' ? 'attention' : 'info',
  title: notification.title,
  message: notification.body,
  url: notification.data?.url || undefined,
  read: notification.read_at !== null,
  createdAt: notification.created_at,
});

export const emptyUnreadByCategory = (): Record<NotificationCategory, number> => ({
  plans: 0,
  office: 0,
  evv: 0,
});
