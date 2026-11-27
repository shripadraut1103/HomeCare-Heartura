import type { ApiActivityKind, ApiEvvStatus, ApiNoteStatus } from '@/domain/logs/interfaces/LogApi';

export type ActivityKind = ApiActivityKind;

export type ActivityFilter = 'all' | Exclude<ActivityKind, 'evv'>;

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  at: string;
  day: string;
}

export type EvvStatus = ApiEvvStatus;

export type NoteStatus = ApiNoteStatus;

export interface VisitLogEntry {
  id: string;
  date: string;
  start: string;
  end: string;
  durationMinutes: number;
  units: number;
  patientName: string;
  visitType: string;
  billingCode: string;
  evvStatus: EvvStatus;
  evvLabel: string;
  noteStatus: NoteStatus;
  noteLabel: string;
  miles: number | null;
}

export interface VisitLogSummary {
  visits: number;
  hours: number;
  units: number;
  miles: number | null;
  notSigned: number;
}

export type VisitLogRange = 14 | 30 | 90;

export interface ActivityLogState {
  filter: ActivityFilter;
  entries: ActivityEntry[];
  total: number;
  page: number;
  hasMore: boolean;
  requestId: string | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export interface VisitLogState {
  range: VisitLogRange;
  entries: VisitLogEntry[];
  summary: VisitLogSummary | null;
  dateFrom: string | null;
  dateTo: string | null;
  requestId: string | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export interface LogsState {
  activity: ActivityLogState;
  visitLog: VisitLogState;
}

export type LogsTab = 'activity' | 'visits';
