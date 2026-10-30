import type { IconName } from '@/components/ui/Icon';

export type StatTone = 'blue' | 'amber' | 'red' | 'rose';

export interface HomeStat {
  id: string;
  count: number;
  label: string;
  tone: StatTone;
  icon: IconName;
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
  stats: HomeStat[];
  unscheduledPatients: number;
  newCases: NewCase[];
}
