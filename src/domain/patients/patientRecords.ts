import type { ThemeColor } from '@/constants/Theme';
import { unitsFor } from '@/domain/notes/dailyNote';
import type {
  NoteFormValues,
  PendingNote,
  PendingNoteKind,
  ProgressNoteDue,
} from '@/domain/notes/interfaces/NoteInterfaces';
import type {
  ChartRecord,
  Patient,
  PatientChart,
  RecordDiscipline,
  RecordKind,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { patientDob } from '@/domain/patients/patientList';
import { formatNumericDate, formatTime } from '@/utils/dateFormat';

export type DocumentationTab = 'daily' | 'evaluation' | 'progress' | 'discharge';

export const SERVICE_NAME: Record<RecordDiscipline, string> = {
  OT: 'Occupational therapy',
  PT: 'Physical therapy',
  Speech: 'Speech therapy',
};

const READ_TITLE: Record<RecordKind, string> = {
  daily: 'Daily note',
  evaluation: 'Evaluation',
  carePlan: 'Care plan',
  progress: 'Progress note',
  discharge: 'Discharge note',
};

type Pill = { label: string; color: ThemeColor; background: ThemeColor };

const SIGNED: Pill = { label: 'Completed & signed', color: 'success', background: 'successMuted' };

export function recordPill(record: ChartRecord): Pill | undefined {
  if (record.kind === 'daily' && record.status === 'signed') return SIGNED;
  if (record.status === 'due')
    return { label: 'Due now', color: 'toneRedFg', background: 'toneRedBg' };
  if (record.status === 'upcoming')
    return { label: 'Upcoming', color: 'toneAmberFg', background: 'toneAmberBg' };
  return undefined;
}

export const recordsForTab = (records: readonly ChartRecord[], tab: DocumentationTab) =>
  records.filter((record) =>
    tab === 'evaluation' ? record.kind === 'evaluation' : record.kind === tab
  );

const signedOn = (record: ChartRecord) =>
  record.signedAt ? formatNumericDate(new Date(record.signedAt)) : record.date;

export function statusLine(record: ChartRecord) {
  switch (record.status) {
    case 'signed':
      return `Active · Signed ${signedOn(record)}`;
    case 'pending':
      return record.kind === 'daily' ? 'Not signed yet' : 'Active · Pending signature';
    case 'cancelled':
      return record.statusNote
        ? `Cancelled · no charge — ${record.statusNote}`
        : 'Cancelled · no charge';
    case 'due':
      return 'Due now';
    case 'upcoming':
      return 'Upcoming';
  }
}

export function recordSubtitle(record: ChartRecord) {
  const service = SERVICE_NAME[record.discipline];
  switch (record.kind) {
    case 'daily':
      return `${record.time} · ${record.therapist}`;
    case 'progress':
      return `${service} · ${record.periodStart} – ${record.periodEnd} · Visit ${record.visitNumber} of ${record.visitsPerNote}`;
    default:
      return `${service} · ${record.date}`;
  }
}

const unitsText = (minutes = 0) => {
  const units = unitsFor(minutes);
  return units === 0 ? 'No units used' : `${units} units · ${minutes} min`;
};

export function recordDetails(record: ChartRecord): { label: string; value: string }[] {
  const service = SERVICE_NAME[record.discipline];
  switch (record.kind) {
    case 'daily':
      return [
        { label: 'Time', value: record.time ?? '—' },
        { label: 'Service', value: `${service} · ${record.visitType ?? 'Daily visit'}` },
        { label: 'Therapist', value: record.therapist },
        { label: 'Units', value: unitsText(record.minutes) },
        ...(record.status === 'signed' ? [] : [{ label: 'Status', value: statusLine(record) }]),
      ];
    case 'progress':
      return [
        { label: 'Service period', value: `${record.periodStart} – ${record.periodEnd}` },
        {
          label: 'Visit',
          value: `Visit ${record.visitNumber} of ${record.visitsPerNote}${
            record.nextVisit
              ? ` · next visit ${record.nextVisit}`
              : record.createdOn
                ? ` · created ${record.createdOn}`
                : ''
          }`,
        },
        { label: 'Therapist', value: record.therapist },
      ];
    case 'discharge':
      return [
        { label: 'Service', value: service },
        { label: 'Discharge date', value: record.date },
        {
          label: 'Reason',
          value: [
            record.reason,
            record.restart === undefined ? undefined : `Restart: ${record.restart ? 'Yes' : 'No'}`,
          ]
            .filter(Boolean)
            .join(' · '),
        },
        { label: 'Therapist', value: record.therapist },
        { label: 'Status', value: statusLine(record) },
      ];
    default:
      return [
        { label: 'Service', value: service },
        { label: 'Date', value: record.date },
        { label: 'Therapist', value: record.therapist },
        { label: 'Status', value: statusLine(record) },
      ];
  }
}

export const hasFullNote = (record: ChartRecord) => record.status !== 'upcoming';

export const readOnlyTitle = (record: ChartRecord) =>
  `${record.kind === 'evaluation' ? record.title : READ_TITLE[record.kind]} · ${SERVICE_NAME[record.discipline]}`;

export function signatureLine(record: ChartRecord) {
  if (!record.signedAt) return 'Pending signature';
  const signed = new Date(record.signedAt);
  return `Signed electronically · ${formatNumericDate(signed)} · ${formatTime(signed).toLowerCase()}`;
}

const primaryDiagnosis = (chart: PatientChart | undefined) => {
  const diagnosis = chart?.diagnoses.find((item) => item.rank === 'primary');
  return diagnosis ? `${diagnosis.code} · ${diagnosis.description}` : undefined;
};

const PREFILL: Partial<
  Record<PendingNoteKind, (patient: Patient, chart?: PatientChart) => NoteFormValues>
> = {
  evaluation: (patient, chart) => ({
    'eval.patientId': patient.code,
    'eval.dateOfBirth': patientDob(patient),
    ...(primaryDiagnosis(chart)
      ? { 'eval.primaryDiagnosis': primaryDiagnosis(chart) as string }
      : {}),
  }),
  carePlan: (patient, chart) => ({
    'carePlan.patientNumber': patient.code,
    'carePlan.dateOfBirth': patientDob(patient),
    ...(primaryDiagnosis(chart)
      ? { 'carePlan.primaryDiagnosis': primaryDiagnosis(chart) as string }
      : {}),
  }),
  dailyNote: (_patient, chart): NoteFormValues => {
    const diagnosis = primaryDiagnosis(chart);
    return diagnosis ? { 'dailyNote.diagnosis': diagnosis } : {};
  },
};

const LABELS: Partial<Record<PendingNoteKind, string>> = {
  evaluation: 'Evaluation',
  carePlan: 'Care plan',
  dailyNote: 'Daily note',
};

export function buildPendingNote(
  id: string,
  patient: Patient,
  chart: PatientChart | undefined,
  kind: 'evaluation' | 'carePlan' | 'dailyNote',
  discipline: RecordDiscipline,
  now = new Date()
): PendingNote {
  return {
    id,
    patientId: patient.id,
    patientName: patient.name,
    kind,
    owner: 'mine',
    label: LABELS[kind] ?? kind,
    details: `${formatNumericDate(now)} · ${formatTime(now)} · ${discipline} · new`,
    status: 'draft',
    draft: {
      discipline,
      visitAt: now.toISOString(),
      dateOfBirth: patientDob(patient),
      prefill: PREFILL[kind]?.(patient, chart),
    },
  };
}

export function buildProgressNoteDue(
  id: string,
  patient: Patient,
  chart: PatientChart | undefined,
  discipline: RecordDiscipline,
  therapist: string,
  record?: ChartRecord,
  now = new Date()
): ProgressNoteDue {
  const service = chart?.services.find((item) => item.name === SERVICE_NAME[discipline]);
  return {
    id,
    patientId: patient.id,
    patientName: patient.name,
    discipline,
    visitsCompleted: record?.visitNumber ?? 10,
    visitsPerNote: record?.visitsPerNote ?? 10,
    details: `${SERVICE_NAME[discipline]} · progress / discharge note`,
    visitAt: now.toISOString(),
    dateOfBirth: patientDob(patient),
    patientCode: patient.code,
    servicePeriod: {
      start: record?.periodStart ?? service?.start ?? formatNumericDate(now),
      end: record?.periodEnd ?? service?.end ?? formatNumericDate(now),
    },
    diagnosis: primaryDiagnosis(chart) ?? '—',
    therapist: record?.therapist ?? therapist,
    prefill: {},
  };
}
