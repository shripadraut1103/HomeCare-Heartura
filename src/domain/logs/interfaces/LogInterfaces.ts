/** How the visit's time was captured for EVV. */
export type VisitVerification = 'gps' | 'manual' | 'exempt';

export interface VisitLogEntry {
  id: string;
  patientName: string;
  visitType: string;
  /** Local ISO date-time. */
  startsAt: string;
  durationMinutes: number;
  units: number;
  billingCode: string;
  verification: VisitVerification;
  /** Why the time was entered by hand; only for `manual`. */
  manualReason?: string;
  signed: boolean;
}

export type ActivityKind = 'clockIn' | 'clockOut' | 'signedNote';

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  details: string;
  /** Local ISO date-time. */
  at: string;
}

export type LogsTab = 'activity' | 'visits';
