export type NotificationCategory = 'plansProgress' | 'office' | 'evvSchedule';

export type NotificationKind =
  | 'carePlanExpiring'
  | 'progressNoteDue'
  | 'officeMessage'
  | 'coverageRequest'
  | 'allotmentChanged'
  | 'authorizationEnding'
  | 'missedClockIn'
  | 'missedClockOut'
  | 'scheduleChange'
  | 'signaturePending';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  kind: NotificationKind;
  title: string;
  message: string;
  patientId?: string;
  visitId?: string;
}
