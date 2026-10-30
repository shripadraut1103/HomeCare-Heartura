import type { IconName } from '@/components/ui/Icon';

export type StatTone = 'blue' | 'amber' | 'red' | 'rose';

export interface HomeStat {
  id: string;
  count: number;
  label: string;
  tone: StatTone;
  icon: IconName;
}

export type VisitStatus = 'scheduled' | 'inProgress' | 'completed' | 'missed';

export interface ScheduledVisit {
  id: string;
  startsAt: string;
  durationMinutes: number;
  patientName: string;
  patientTag: string;
  details: string;
  status: VisitStatus;
}

export interface NewCase {
  id: string;
  patientName: string;
  discipline: string;
  summary: string;
  note?: string;
}

export interface HomeSummary {
  providerName: string;
  unreadNotifications: number;
  stats: HomeStat[];
  unscheduledPatients: number;
  todaysVisits: ScheduledVisit[];
  newCases: NewCase[];
}
