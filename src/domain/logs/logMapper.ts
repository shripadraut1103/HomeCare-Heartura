import type {
  ApiActivity,
  ApiVisitLogRow,
  ApiVisitLogSummary,
} from '@/domain/logs/interfaces/LogApi';
import type {
  ActivityEntry,
  VisitLogEntry,
  VisitLogRange,
  VisitLogSummary,
} from '@/domain/logs/interfaces/LogInterfaces';
import { toIsoDate } from '@/utils/dateFormat';

const toMiles = (value: string | null) => {
  if (value === null || value === '') return null;
  const miles = Number(value);
  return Number.isFinite(miles) ? miles : null;
};

const toTimeOfDay = (value: string) => value.slice(0, 5);

export const toActivityEntry = (api: ApiActivity): ActivityEntry => ({
  id: api.id,
  kind: api.kind,
  title: api.title,
  subtitle: api.subtitle,
  at: api.at,
  day: api.day,
});

export const toVisitLogEntry = (api: ApiVisitLogRow): VisitLogEntry => ({
  id: api.id,
  date: api.date,
  start: toTimeOfDay(api.clock_in ?? api.start_time),
  end: toTimeOfDay(api.clock_out ?? api.end_time),
  durationMinutes: api.duration_min,
  units: api.units,
  patientName: api.patient.name,
  visitType: api.visit_type_label || api.service_label,
  billingCode: api.billing_code,
  evvStatus: api.evv_status,
  evvLabel: api.evv_label,
  noteStatus: api.note_status,
  noteLabel: api.note_label,
  miles: toMiles(api.miles),
});

export const toVisitLogSummary = (api: ApiVisitLogSummary): VisitLogSummary => ({
  visits: api.visits,
  hours: api.hours,
  units: api.units,
  miles: toMiles(api.miles),
  notSigned: api.not_signed,
});

export function visitLogDates(range: VisitLogRange, today = new Date()) {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (range - 1));
  return { date_from: toIsoDate(from), date_to: toIsoDate(today) };
}
