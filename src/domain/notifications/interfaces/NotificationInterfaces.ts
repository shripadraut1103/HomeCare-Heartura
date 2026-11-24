export type NotificationCategory = 'plans' | 'office' | 'evv';

export type NotificationLevel = 'info' | 'attention';

export interface AppNotification {
  id: string;
  kind: string;
  category: NotificationCategory;
  level: NotificationLevel;
  title: string;
  message: string;
  url?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationDay {
  date: string;
  count: number;
  unread: number;
}

export interface NotificationList {
  ids: string[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export interface NotificationsState {
  byId: Record<string, AppNotification>;
  lists: Record<string, NotificationList>;
  days: NotificationDay[];
  daysLoading: boolean;
  daysLoaded: boolean;
  daysError: string | null;
  unread: { total: number; byCategory: Record<NotificationCategory, number> };
}
