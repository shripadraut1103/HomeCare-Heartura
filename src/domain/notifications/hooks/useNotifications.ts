import { useState } from 'react';

import type { AppNotification } from '@/domain/notifications/interfaces/NotificationInterfaces';
import { MOCK_NOTIFICATIONS } from '@/domain/notifications/mocks/NotificationMocks';

export function useNotifications(): AppNotification[] {
  const [notifications] = useState(MOCK_NOTIFICATIONS);
  return notifications;
}
