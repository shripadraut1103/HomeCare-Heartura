export type ApiActivityKind = 'note' | 'request' | 'visit' | 'profile' | 'evv';

export interface ApiActivity {
  id: string;
  at: string;
  day: string;
  kind: ApiActivityKind;
  activity: string;
  title: string;
  subtitle: string;
  patient: { id: string; name: string } | null;
}

export interface ApiActivityQuery {
  kind?: ApiActivityKind;
  date_from?: string;
  date_to?: string;
  page: number;
}

export type ApiEvvStatus = 'exempt' | 'not_recorded' | 'gps' | 'manual';

export type ApiNoteStatus = 'signed' | 'draft' | 'missing';

export interface ApiVisitLogRow {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  clock_in: string | null;
  clock_out: string | null;
  duration_min: number;
  units: number;
  patient: { id: string; name: string; mrn: string };
  service_code: string;
  service_label: string;
  visit_type: string;
  visit_type_label: string;
  billing_code: string;
  evv_status: ApiEvvStatus;
  evv_label: string;
  note_status: ApiNoteStatus;
  note_label: string;
  miles: string | null;
}

export interface ApiVisitLogSummary {
  visits: number;
  minutes: number;
  hours: number;
  units: number;
  miles: string | null;
  not_signed: number;
}

export interface ApiVisitLog {
  date_from: string;
  date_to: string;
  summary: ApiVisitLogSummary;
  results: ApiVisitLogRow[];
}
