import type { Href } from 'expo-router';

import type {
  AppNotification,
  NotificationKind,
} from '@/domain/notifications/interfaces/NotificationInterfaces';

export type NotificationTarget =
  { type: 'screen'; href: Href } | { type: 'visit'; visitId: string };

const visitDetails = (notification: AppNotification): NotificationTarget | null =>
  notification.visitId ? { type: 'visit', visitId: notification.visitId } : null;

/**
 * The one place that decides what a notification opens.
 */
const TARGETS: Record<
  NotificationKind,
  (notification: AppNotification) => NotificationTarget | null
> = {
  carePlanExpiring: visitDetails,
  progressNoteDue: () => null,
  officeMessage: () => null,
  coverageRequest: () => null,
  allotmentChanged: () => null,
  authorizationEnding: () => null,
  missedClockIn: () => null,
  missedClockOut: () => null,
  scheduleChange: () => null,
  signaturePending: () => null,
};

export const getNotificationTarget = (notification: AppNotification) =>
  TARGETS[notification.kind](notification);
