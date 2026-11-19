/**
 * Shapes of `/api/patients/` responses, copied from the OpenAPI schema (`GET /api/schema/`).
 * Regenerate rather than edit by hand when the backend changes.
 */

export interface ApiPage<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiPatient {
  id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  primary_provider: { id: string; full_name: string; member_code: string } | null;
  dob: string;
  ddd_id: string;
  medicaid_id: string;
  services: string[];
  services_label: string;
  group_home: { id: string; name: string } | null;
  support_coordinator: { id: string; name: string; agency: string } | null;
  status: string;
  status_label: string;
  status_note: string;
  location: { setting: string; place_of_service: string; evv_required: boolean } | null;
  service_location?: {
    code: string;
    label: string;
    evv_required: boolean;
    address: string;
  } | null;
  county: string;
  providers: { id: string; name: string; discipline: string }[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ApiChartNote {
  id: string;
  title: string;
  note_date: string;
  text: string;
  is_critical: boolean;
  author_name: string;
  created_at: string;
  version?: number;
}

export interface ApiNoteCreate {
  title: string;
  note_date: string;
  text: string;
  is_critical: boolean;
}

export interface ApiServiceUnits {
  unit_type: string;
  pa_number: string;
  authorization_start: string;
  authorization_end: string | null;
  week_used: number;
  week_allowed: number | null;
  remaining: number | null;
  used: number;
  authorized: number | null;
  accrued: number | null;
  missed: number;
  makeup: number | null;
  makeup_until: string | null;
}

export interface ApiChartService {
  id: string;
  code: string;
  label: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  status_label: string;
  payer: string;
  units: ApiServiceUnits | null;
}

export interface ApiChartEligibility {
  payer: string;
  status: string;
  status_label: string;
  eligible: boolean | null;
  checked_at: string | null;
}

export interface ApiPatientChart {
  id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  status: string;
  dob: string | null;
  sex: string;
  language: string;
  ddd_id: string;
  medicaid_id: string;
  services: string[];
  guardians: { name: string; relationship: string; email: string; phone?: string }[];
  addresses: string[];
  phones: { type: string; number: string; ext: string }[];
  email: string;
  alert: { text: string; author: string; date: string } | null;
  diagnoses: {
    id: string;
    code: string;
    description: string;
    primary: boolean;
    from_intake?: boolean;
    type: string;
    onset: string | null;
    status: string;
    noted_by: string;
    version?: number;
  }[];
  primary_diagnosis: { code: string; description: string } | null;
  allergies: {
    id: string;
    substance: string;
    reaction: string;
    severity: string;
    kind: string;
    onset: string | null;
    status: string;
    recorded_by: string;
    version?: number;
  }[];
  group_home: {
    agency: string;
    name: string;
    address: string;
    phone: string;
    manager: string;
  } | null;
  support_coordination: {
    agency: string;
    coordinator: string;
    email: string;
    supervisor: string;
  } | null;
  ordering_physician: string;
  primary_care: { name: string; address: string; phone: string; email: string; fax: string };
  insurance: { primary: string; member_id: string; secondary: string } | null;
  activity: { id: string; title: string; at: string; actor: string }[];
  critical_notes: ApiChartNote[];
  recent_notes: ApiChartNote[];
  is_new: boolean;
  payers: { name: string; priority: string; plan_type: string; member_id: string }[];
  units_this_week: { used: number; authorized: number; remaining: number; makeup: number } | null;
  eligibility: ApiChartEligibility | null;
  address_list: { type: string; type_label: string; line: string; is_primary: boolean }[];
  service_details: ApiChartService[];
}

export interface ApiDiagnosis {
  id: string;
  name: string;
  icd10: string;
  type: string;
  type_label: string;
  onset: string | null;
  status: string;
  status_label: string;
  noted_by: string;
  primary: boolean;
  from_intake: boolean;
  version: number;
}

export interface ApiDiagnosisCreate {
  name: string;
  icd10?: string;
  type?: 'chronic' | 'acute' | '';
  onset?: string | null;
  status?: 'active' | 'monitoring' | '';
}

export interface ApiAllergy {
  id: string;
  substance: string;
  kind: string;
  kind_label: string;
  reaction: string;
  severity: string;
  severity_label: string;
  onset: string | null;
  status: string;
  status_label: string;
  recorded_by: string;
  version: number;
}

export interface ApiAllergyCreate {
  substance: string;
  reaction?: string;
  severity?: 'mild' | 'moderate' | 'severe' | '';
  kind?: 'medication' | 'environmental' | '';
  onset?: string | null;
  status?: 'active' | '';
}

export interface ApiHistoryEntry {
  id: string;
  kind: string;
  name: string;
  date: string | null;
  facility: string;
  status: string;
  status_label?: string;
  relative: string;
  onset_age: number | null;
  detail: string;
  note: string;
  version?: number;
}

export interface ApiHistoryCreate {
  kind: 'surgical' | 'medical' | 'family' | 'social';
  name: string;
  date?: string | null;
  facility?: string;
  status?: 'active' | 'resolved' | '';
  relative?: string;
  onset_age?: number | null;
  detail?: string;
  note?: string;
}

export interface ApiPatientDocument {
  id: string;
  name: string;
  file_name: string;
  category: string;
  category_label: string;
  section: string;
  section_label: string;
  status: string;
  status_label: string;
  document_date: string | null;
  uploaded_at: string;
  uploaded_by: string;
  size: number;
  mime_type: string;
  version: number;
}

export interface ApiPatientDocumentFile extends ApiPatientDocument {
  url: string | null;
  download_url: string | null;
  expires_in: number;
}

export type ApiDocumentSection = 'providers' | 'back_office';
export type ApiDocumentCategory = 'isp' | 'treatment_plan' | 'prescription' | 'other';

export interface ApiDocumentUpload {
  section: ApiDocumentSection;
  category: ApiDocumentCategory;
  name?: string;
  document_date?: string | null;
  file: { uri: string; name: string; type: string };
}

export interface ApiIncident {
  id: string;
  number: number;
  label: string;
  summary: string;
  occurred_on: string;
  occurred_time: string | null;
  type_label: string;
  location_label: string;
  injury_side_label: string;
  witnessed_by: string;
  what_happened: string;
  action_taken: string;
  notify_back_office: boolean;
  status: string;
  comment?: string;
  reported_by: { id: string; full_name: string } | null;
  version?: number;
}

export type ApiIncidentType =
  'fall' | 'injury' | 'behavioral' | 'medication-error' | 'elopement' | 'other';
export type ApiIncidentLocation = 'group-home' | 'day-program' | 'community' | 'vehicle' | '';
export type ApiInjurySide = 'none' | 'left' | 'right' | 'both' | '';

export interface ApiIncidentCreate {
  occurred_on: string;
  occurred_time: string | null;
  type: ApiIncidentType;
  location?: ApiIncidentLocation;
  injury_side?: ApiInjurySide;
  witnessed_by?: string;
  what_happened: string;
  action_taken?: string;
  notify_back_office?: boolean;
}

export interface ApiIncidentUpdate {
  version: number;
  comment?: string;
  status?: 'acknowledged' | 'closed';
}

export interface ApiCoverage {
  id: string;
  payer?: string | null;
  payer_name: string;
  plan: string;
  plan_type?: string;
  plan_type_label: string;
  member_id: string;
  group_id: string;
  effective_start: string | null;
  effective_end: string | null;
  priority: string | null;
  is_active: boolean;
  insured_relationship?: string;
  insured_relationship_label: string;
  eligibility_status: string;
  card_front_url?: string | null;
  card_back_url?: string | null;
  version?: number;
}

export type ApiCoveragePriority = 'primary' | 'secondary' | 'tertiary';
export type ApiInsuredRelationship = 'self' | 'parent' | 'guardian' | 'spouse' | 'other';

export interface ApiCoverageCreate {
  payer: string;
  plan?: string;
  plan_type?: string;
  member_id?: string;
  effective_start?: string | null;
  effective_end?: string | null;
  is_active?: boolean;
  priority: ApiCoveragePriority;
  insured_relationship: ApiInsuredRelationship;
}

export type ApiOption = { value: string; label: string };

export interface ApiCoverageOptions {
  payers: (ApiOption & { payer_type: string })[];
  plan_types: ApiOption[];
  priorities: ApiOption[];
  insured_relationships: ApiOption[];
}
