import type { Href } from 'expo-router';

import type { AppNotification } from '@/domain/notifications/interfaces/NotificationInterfaces';

export type NotificationTarget =
  { type: 'screen'; href: Href } | { type: 'visit'; visitId: string };

const UUID = '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})';
const VISIT_URL = new RegExp(`(?:appointments?|visits?)(?:_?id)?[/=]${UUID}`, 'i');
const PATIENT_URL = new RegExp(`patients?/${UUID}`, 'i');

export const getNotificationTarget = (notification: AppNotification) =>
  targetFromUrl(notification.url);

export function targetFromUrl(url: string | undefined): NotificationTarget | null {
  if (!url) return null;
  const visit = url.match(VISIT_URL);
  if (visit) return { type: 'visit', visitId: visit[1] };
  const patient = url.match(PATIENT_URL);
  if (patient)
    return { type: 'screen', href: { pathname: '/patient/[id]', params: { id: patient[1] } } };
  return null;
}
