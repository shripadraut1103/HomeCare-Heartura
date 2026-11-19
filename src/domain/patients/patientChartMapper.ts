import type {
  ApiAllergy,
  ApiChartNote,
  ApiChartService,
  ApiCoverage,
  ApiDiagnosis,
  ApiHistoryEntry,
  ApiIncident,
  ApiIncidentCreate,
  ApiPatientChart,
  ApiPatientDocument,
} from '@/domain/patients/interfaces/PatientApi';
import type {
  Allergy,
  ChartNote,
  ConditionStatus,
  CoverageLevel,
  Diagnosis,
  HistoryCategory,
  HistoryEntry,
  IncidentStatus,
  InsurancePlan,
  Patient,
  PatientChart,
  PatientDocument,
  PatientIncident,
  PatientService,
} from '@/domain/patients/interfaces/PatientInterfaces';
import { socialSummary } from '@/domain/patients/patientHistory';
import { serviceName } from '@/domain/patients/patientMapper';
import { formatNumericDate, parseIsoDate, toIsoDate } from '@/utils/dateFormat';

const HISTORY_CATEGORIES: readonly HistoryCategory[] = ['surgical', 'medical', 'family', 'social'];
const COVERAGE_LEVELS: readonly CoverageLevel[] = ['primary', 'secondary', 'tertiary'];

const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  allowed.find((option) => option === value.toLowerCase()) ?? fallback;

const optional = (value: string | null | undefined) => value || undefined;

export const toNumericDate = (iso: string | null | undefined) => {
  if (!iso) return undefined;
  if (!iso.includes('T')) return formatNumericDate(parseIsoDate(iso));
  const moment = new Date(iso);
  return Number.isNaN(moment.getTime()) ? undefined : formatNumericDate(moment);
};

export const toLabel = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ') : '';

const labelOf = (labels: Record<string, string>, value: string) => labels[value] ?? toLabel(value);

const LANGUAGES: Record<string, string> = {
  english: 'English',
  spanish: 'Spanish',
  other: 'Other — interpreter',
};

const PHONE_TYPES: Record<string, string> = {
  home: 'Home',
  cell: 'Cell',
  work: 'Work',
  other: 'Other',
};

const RELATIONSHIPS: Record<string, string> = {
  parent: 'Parent',
  sibling: 'Sibling',
  other_relative: 'Other relative',
  guardian: 'Court-appointed guardian',
  other: 'Other',
};

export function toChartNote(note: ApiChartNote): ChartNote {
  return {
    id: note.id,
    text: note.text,
    author: note.author_name,
    date: toNumericDate(note.note_date) ?? '',
    critical: note.is_critical || undefined,
    version: note.version,
  };
}

export function toDiagnosis(item: ApiDiagnosis): Diagnosis {
  return {
    id: item.id,
    code: item.icd10,
    description: item.name,
    rank: item.primary ? 'primary' : 'secondary',
    type: pick(item.type, ['chronic', 'acute'], 'chronic'),
    status: pick(item.status, ['active', 'monitoring', 'resolved'], 'active'),
    onset: toNumericDate(item.onset),
    notedBy: optional(item.noted_by),
    version: item.version,
  };
}

export function toAllergy(item: ApiAllergy): Allergy {
  return {
    id: item.id,
    name: item.substance,
    kind: item.kind_label || toLabel(item.kind),
    reaction: item.reaction,
    severity: pick(item.severity, ['mild', 'moderate', 'severe'], 'mild'),
    status: pick(item.status, ['active', 'inactive'], 'active'),
    onset: toNumericDate(item.onset),
    recordedBy: optional(item.recorded_by),
    version: item.version,
  };
}

export function toService(service: ApiChartService): PatientService {
  const units = service.units;
  return {
    id: service.id,
    code: service.code,
    name: service.label || serviceName(service.code),
    start: toNumericDate(service.start_date) ?? '',
    end: toNumericDate(service.end_date) ?? '',
    status: service.status,
    statusLabel: service.status_label || service.status,
    payer: service.payer,
    units: units
      ? {
          used: units.used,
          total: units.authorized,
          accrued: units.accrued,
          missed: units.missed,
          makeup: units.makeup,
        }
      : undefined,
    team: [],
  };
}

const withAuthorization = (payer: string, services: readonly ApiChartService[]) => {
  const pa = services.find((service) => service.payer === payer && service.units?.pa_number)?.units
    ?.pa_number;
  if (!pa) return payer;
  return `${payer} · ${pa.startsWith('PA') ? pa : `PA ${pa}`}`;
};

export function toPatientFields(chart: ApiPatientChart): Partial<Patient> {
  const primary = chart.address_list.find((item) => item.is_primary) ?? chart.address_list[0];
  return {
    isNew: chart.is_new,
    payers: chart.payers.map((payer) => withAuthorization(payer.name, chart.service_details)),
    units: {
      usedThisWeek: chart.units_this_week?.used ?? 0,
      authorizedPerWeek: chart.units_this_week?.authorized ?? 0,
      remainingInclMakeup: chart.units_this_week?.remaining ?? 0,
    },
    address: primary?.line ?? chart.addresses[0] ?? '',
    phone: chart.phones[0]?.number ?? '',
    guardian: chart.guardians[0]?.name || undefined,
  };
}

// TODO: confirm the enum values with the backend; unknown values fall back to the first option.
export function toChartFields(chart: ApiPatientChart): Partial<PatientChart> {
  const diagnoses: Diagnosis[] = chart.diagnoses.map((item) => ({
    id: item.id,
    code: item.code,
    description: item.description,
    rank: item.primary ? 'primary' : 'secondary',
    type: pick(item.type, ['chronic', 'acute'], 'chronic'),
    status: pick(item.status, ['active', 'monitoring', 'resolved'], 'active'),
    onset: toNumericDate(item.onset),
    notedBy: optional(item.noted_by),
    version: item.version,
  }));
  const allergies: Allergy[] = chart.allergies.map((item) => ({
    id: item.id,
    name: item.substance,
    kind: toLabel(item.kind),
    reaction: item.reaction,
    severity: pick(item.severity, ['mild', 'moderate', 'severe'], 'mild'),
    status: pick(item.status, ['active', 'inactive'], 'active'),
    onset: toNumericDate(item.onset),
    recordedBy: optional(item.recorded_by),
    version: item.version,
  }));
  const notes = [...chart.critical_notes, ...chart.recent_notes]
    .filter((note, index, all) => all.findIndex((other) => other.id === note.id) === index)
    .map(toChartNote);
  const addresses = chart.address_list.length
    ? [...chart.address_list]
        .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
        .map((item) => ({ label: item.type_label || toLabel(item.type), line: item.line }))
    : chart.addresses.map((line, index) => ({
        label: index === 0 ? 'Primary' : 'Second',
        line,
      }));

  return {
    sex: toLabel(chart.sex),
    language: labelOf(LANGUAGES, chart.language),
    dddId: chart.ddd_id,
    guardian: chart.guardians
      .map((guardian) =>
        [
          guardian.name,
          guardian.relationship && labelOf(RELATIONSHIPS, guardian.relationship),
          guardian.phone,
        ]
          .filter(Boolean)
          .join(' · ')
      )
      .join('\n'),
    phones: chart.phones.map((phone) =>
      [
        phone.ext ? `${phone.number} ext. ${phone.ext}` : phone.number,
        phone.type && labelOf(PHONE_TYPES, phone.type),
      ]
        .filter(Boolean)
        .join(' · ')
    ),
    email: optional(chart.email),
    addresses,
    groupHome: chart.group_home ?? undefined,
    insurance: {
      primary: chart.insurance?.primary ?? '',
      secondary: optional(chart.insurance?.secondary),
    },
    eligibility: {
      payer: chart.eligibility?.payer ?? '',
      eligible: chart.eligibility?.eligible ?? null,
      status: optional(chart.eligibility?.status),
      label: optional(chart.eligibility?.status_label),
    },
    services: chart.service_details.map(toService),
    diagnoses,
    allergies,
    notes,
  };
}

export function toHistoryEntry(entry: ApiHistoryEntry): HistoryEntry {
  return {
    id: entry.id,
    category: pick(entry.kind, HISTORY_CATEGORIES, 'medical'),
    title: entry.name,
    date: toNumericDate(entry.date),
    facility: optional(entry.facility),
    status: entry.status
      ? pick<ConditionStatus>(entry.status, ['active', 'resolved'], 'active')
      : undefined,
    relative: optional(entry.relative),
    onsetAge: entry.onset_age === null ? undefined : String(entry.onset_age),
    detail: optional(entry.detail),
    summary: entry.detail ? socialSummary(entry.detail) : undefined,
    note: optional(entry.note),
    version: entry.version,
  };
}

const INCIDENT_STATUSES: Record<string, IncidentStatus> = {
  open: 'open',
  acknowledged: 'acknowledged',
  closed: 'closed',
};

export function toIncident(incident: ApiIncident): PatientIncident {
  const [year, month, day] = incident.occurred_on.split('-').map(Number);
  const [hours = 0, minutes = 0] = (incident.occurred_time ?? '').split(':').map(Number);
  return {
    id: incident.id,
    code: incident.label || `INC-${incident.number}`,
    occurredAt: new Date(year, month - 1, day, hours, minutes).toISOString(),
    description: incident.summary || incident.what_happened,
    reportedBy: incident.reported_by?.full_name ?? '',
    type: optional(incident.type_label),
    location: optional(incident.location_label),
    injury: optional(incident.injury_side_label),
    witnessedBy: optional(incident.witnessed_by),
    actionTaken: optional(incident.action_taken),
    status: INCIDENT_STATUSES[incident.status] ?? 'open',
    notifyOffice: incident.notify_back_office,
    comment: optional(incident.comment ?? ''),
    version: incident.version,
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

export function toIncidentRequest(
  occurredAt: Date,
  fields: Omit<ApiIncidentCreate, 'occurred_on' | 'occurred_time'>
): ApiIncidentCreate {
  return {
    occurred_on: toIsoDate(occurredAt),
    occurred_time: `${pad(occurredAt.getHours())}:${pad(occurredAt.getMinutes())}:00`,
    ...fields,
  };
}

export function toInsurancePlan(coverage: ApiCoverage): InsurancePlan {
  return {
    id: coverage.id,
    coverage: pick(coverage.priority ?? '', COVERAGE_LEVELS, 'primary'),
    name: coverage.payer_name,
    relationship: coverage.insured_relationship_label,
    memberId: optional(coverage.member_id),
    planName: optional(coverage.plan),
    planType: optional(coverage.plan_type_label),
    groupId: optional(coverage.group_id),
    effectiveStart: toNumericDate(coverage.effective_start),
    effectiveEnd: toNumericDate(coverage.effective_end),
    cardFront: optional(coverage.card_front_url),
    cardBack: optional(coverage.card_back_url),
  };
}

export function toDocument(document: ApiPatientDocument): PatientDocument {
  return {
    id: document.id,
    title: document.name || document.file_name,
    kind: document.category_label || toLabel(document.category),
    author: document.uploaded_by,
    status: document.status,
    statusLabel: optional(document.status_label),
    date: toNumericDate(document.uploaded_at) ?? '',
    documentDate: toNumericDate(document.document_date),
    section: optional(document.section_label),
    fileName: optional(document.file_name),
    mimeType: optional(document.mime_type),
    version: document.version,
  };
}

const TITLE_LENGTH = 80;

export const noteTitle = (text: string) => {
  const line = text.trim().split('\n')[0];
  return line.length > TITLE_LENGTH ? `${line.slice(0, TITLE_LENGTH - 1)}…` : line;
};
