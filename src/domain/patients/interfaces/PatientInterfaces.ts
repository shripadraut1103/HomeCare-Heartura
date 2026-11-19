import type { Visit } from '@/domain/visits/interfaces/VisitInterfaces';

export interface IndividualServicePlan {
  patientId: string;
  planStart: string;
  planEnd: string;
  signedOn: string;
  services: string;
  fileName: string;
  outcomes: readonly string[];
  risks: readonly string[];
  older: readonly { label: string; signedOn: string }[];
}

export type PatientStatus =
  'active' | 'suspended' | 'inactive' | 'prospect' | 'request' | 'denied' | 'discharged';

export interface Patient {
  id: string;
  name: string;
  tag: string;
  code: string;
  status: PatientStatus;
  statusLabel?: string;
  medicaidId?: string;
  dateOfBirth: string;
  discipline: string;
  isNew?: boolean;
  serviceLocation: string;
  locationLabel?: string;
  payers: readonly string[];
  address: string;
  phone: string;
  guardian?: string;
  units: { usedThisWeek: number; authorizedPerWeek: number; remainingInclMakeup: number };
}

export type PatientSort = 'name' | 'age';

export interface PatientService {
  id: string;
  code?: string;
  name: string;
  start: string;
  end: string;
  status: string;
  statusLabel?: string;
  payer: string;
  units?: {
    used: number;
    total: number | null;
    accrued: number | null;
    missed: number;
    makeup: number | null;
  };
  team: readonly string[];
}

export type DiagnosisType = 'chronic' | 'acute';

export type DiagnosisStatus = 'active' | 'monitoring' | 'resolved';

export interface Diagnosis {
  id: string;
  code: string;
  description: string;
  rank: 'primary' | 'secondary';
  type: DiagnosisType;
  status: DiagnosisStatus;
  onset?: string;
  notedBy?: string;
  version?: number;
}

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export type AllergyStatus = 'active' | 'inactive';

export interface Allergy {
  id: string;
  name: string;
  kind: string;
  reaction: string;
  severity: AllergySeverity;
  status: AllergyStatus;
  onset?: string;
  recordedBy?: string;
  version?: number;
}

export interface GroupHome {
  agency: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
}

export interface ChartNote {
  id: string;
  text: string;
  author: string;
  date: string;
  critical?: boolean;
  version?: number;
}

export type CoverageLevel = 'primary' | 'secondary' | 'tertiary';

export interface InsurancePlan {
  id: string;
  coverage: CoverageLevel;
  name: string;
  relationship: string;
  memberId?: string;
  planName?: string;
  planType?: string;
  groupId?: string;
  effectiveStart?: string;
  effectiveEnd?: string;
  cardFront?: string;
  cardBack?: string;
}

export type DocumentStatus =
  'current' | 'received' | 'pending' | 'signed' | 'onFile' | 'superseded';

export interface PatientDocument {
  id: string;
  title: string;
  kind: string;
  author: string;
  status: DocumentStatus | string;
  statusLabel?: string;
  date: string;
  documentDate?: string;
  section?: string;
  fileName?: string;
  mimeType?: string;
  uri?: string;
  version?: number;
}

export type HistoryCategory = 'surgical' | 'medical' | 'family' | 'social';

export type ConditionStatus = 'active' | 'resolved';

export interface HistoryEntry {
  id: string;
  category: HistoryCategory;
  title: string;
  date?: string;
  facility?: string;
  status?: ConditionStatus;
  relative?: string;
  onsetAge?: string;
  detail?: string;
  summary?: string;
  note?: string;
  version?: number;
}

export type RecordKind = 'daily' | 'evaluation' | 'carePlan' | 'progress' | 'discharge';

export type RecordDiscipline = 'OT' | 'PT' | 'Speech';

export type RecordStatus = 'signed' | 'pending' | 'cancelled' | 'due' | 'upcoming';

export interface ChartRecord {
  id: string;
  kind: RecordKind;
  discipline: RecordDiscipline;
  title: string;
  date: string;
  time?: string;
  therapist: string;
  assistant?: string;
  status: RecordStatus;
  signedAt?: string;
  visitType?: string;
  minutes?: number;
  statusNote?: string;
  carePlanId?: string;
  planStart?: string;
  planEnd?: string;
  periodStart?: string;
  periodEnd?: string;
  visitNumber?: number;
  visitsPerNote?: number;
  createdOn?: string;
  nextVisit?: string;
  reason?: string;
  restart?: boolean;
  values?: Record<string, string | readonly string[]>;
}

export type IncidentStatus = 'open' | 'acknowledged' | 'closed';

export interface PatientIncident {
  id: string;
  code: string;
  occurredAt: string;
  description: string;
  reportedBy: string;
  type?: string;
  location?: string;
  injury?: string;
  witnessedBy?: string;
  actionTaken?: string;
  status?: IncidentStatus;
  notifyOffice?: boolean;
  comment?: string;
  version?: number;
}

export interface PatientChart {
  patientId: string;
  sex: string;
  language: string;
  dddId: string;
  eligibility: { payer: string; eligible: boolean | null; status?: string; label?: string };
  guardian: string;
  groupHome?: GroupHome;
  addresses?: readonly { label: string; line: string }[];
  providers?: readonly { name: string; discipline: string }[];
  header?: Partial<Patient>;
  phones: readonly string[];
  email?: string;
  allergies: readonly Allergy[];
  insurance: { primary: string; secondary?: string };
  insurancePlans: readonly InsurancePlan[];
  diagnoses: readonly Diagnosis[];
  services: readonly PatientService[];
  notes: readonly ChartNote[];
  documents: readonly PatientDocument[];
  history: readonly HistoryEntry[];
  incidents: readonly PatientIncident[];
  appointments?: readonly Visit[];
  records: readonly ChartRecord[];
}

export type HistoryResource = `history:${HistoryCategory}`;

export type PatientResource =
  | 'chart'
  | 'diagnoses'
  | 'allergies'
  | 'notes'
  | 'incidents'
  | 'coverages'
  | 'documents'
  | 'appointments'
  | HistoryResource;

export interface ResourceStatus {
  loading: boolean;
  loaded: boolean;
  error: string | null;
  stale?: boolean;
}

export interface PatientListState {
  ids: string[];
  count: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

export interface PatientsState {
  byId: Record<string, Patient>;
  list: PatientListState;
  detailError: string | null;
  charts: Record<string, PatientChart>;
  resources: Record<string, Partial<Record<PatientResource, ResourceStatus>>>;
}
