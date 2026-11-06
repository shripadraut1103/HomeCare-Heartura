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
  'active' | 'suspended' | 'inactive' | 'prospect' | 'deniedServices' | 'discharged';

export interface Patient {
  id: string;
  name: string;
  tag: string;
  code: string;
  status: PatientStatus;
  medicaidId?: string;
  dateOfBirth: string;
  discipline: string;
  isNew?: boolean;
  serviceLocation: string;
  payers: readonly string[];
  address: string;
  phone: string;
  guardian?: string;
  units: { usedThisWeek: number; authorizedPerWeek: number; remainingInclMakeup: number };
}

export type PatientSort = 'name' | 'age';

export type ServiceStatus = 'active' | 'privatePay' | 'onHold' | 'ended';

export interface PatientService {
  id: string;
  name: string;
  start: string;
  end: string;
  status: ServiceStatus;
  payer: string;
  units?: { used: number; total: number; accrued: number; missed: number; makeup: number };
  team: readonly string[];
}

export interface Diagnosis {
  code: string;
  description: string;
  rank: 'primary' | 'secondary';
}

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export interface Allergy {
  name: string;
  kind: string;
  reaction: string;
  severity: AllergySeverity;
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
}

export type DocumentStatus = 'current' | 'signed' | 'onFile' | 'superseded';

export interface PatientDocument {
  id: string;
  title: string;
  kind: string;
  author: string;
  status: DocumentStatus;
  date: string;
  documentDate?: string;
  section?: string;
  fileName?: string;
  mimeType?: string;
  uri?: string;
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
}

export interface PatientIncident {
  id: string;
  occurredAt: string;
  description: string;
  reportedBy: string;
}

export interface PatientChart {
  patientId: string;
  sex: string;
  language: string;
  dddId: string;
  eligibility: { payer: string; eligible: boolean };
  guardian: string;
  groupHome?: GroupHome;
  secondAddress?: string;
  phones: readonly string[];
  email?: string;
  allergies: readonly Allergy[];
  insurance: { primary: string; secondary?: string };
  diagnoses: readonly Diagnosis[];
  services: readonly PatientService[];
  notes: readonly ChartNote[];
  documents: readonly PatientDocument[];
  history: readonly HistoryEntry[];
  incidents: readonly PatientIncident[];
}

export interface PatientsState {
  charts: Record<string, PatientChart>;
}
