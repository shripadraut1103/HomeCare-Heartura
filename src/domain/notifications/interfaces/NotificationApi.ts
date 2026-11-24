export type ApiNotificationCategory = 'plans' | 'office' | 'evv';

export type ApiNotificationLevel = 'info' | 'attention';

export interface ApiNotification {
  id: string;
  kind: string;
  category: ApiNotificationCategory;
  level: ApiNotificationLevel;
  title: string;
  body: string;
  data: Record<string, string>;
  read_at: string | null;
  created_at: string;
}

export interface ApiNotificationDay {
  date: string;
  count: number;
  unread: number;
}

export interface ApiUnreadCount {
  count: number;
  by_category: Record<string, number>;
}

export interface ApiMarkRead {
  updated: number;
}

export type ApiPushPlatform = 'web' | 'ios' | 'android';
