import type {
  ApiAuthorizationRef,
  ApiPatientSummary,
  ApiProviderSummary,
} from '@/domain/visits/interfaces/AppointmentApi';

export interface ApiLabelValue {
  value: string;
  label: string;
}

export interface ApiPlaceOption extends ApiLabelValue {
  evv_required: boolean;
}

export interface ApiSchedulingReference {
  statuses: ApiLabelValue[];
  visit_types: ApiLabelValue[];
  services: ApiLabelValue[];
  payers: ApiLabelValue[];
  places_of_service: ApiPlaceOption[];
  repeat_units: ApiLabelValue[];
  repeat_ends: ApiLabelValue[];
  duration: { min: number; max: number; step: number };
  minutes_per_unit: number;
  max_repeats: number;
  providers: ApiProviderSummary[];
}

export interface ApiPatientOption {
  id: string;
  name: string;
  mrn: string;
  dob: string | null;
  town: string;
  status: string;
}

export interface ApiPage<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiPatientAddressOption {
  id: string;
  kind: string;
  line: string;
  use_for_evv: boolean;
}

export interface ApiServicePlanAuthorization {
  id: string;
  source: string;
  pa_number: string;
  start_date: string;
  end_date: string | null;
}

export interface ApiServicePlan {
  service_code: string;
  provider_ids: string[];
  authorizations: ApiServicePlanAuthorization[];
}

export interface ApiBookablePatient extends ApiPatientSummary {
  addresses: ApiPatientAddressOption[];
  private_pay_enabled: boolean;
  primary_payer: string;
  service_plans: ApiServicePlan[];
}

export type ApiVisitType = 'daily' | 'evaluation';
export type ApiPayer = 'medicaid' | 'private_pay';

export interface ApiBookingSlot {
  patient: string;
  provider: string;
  service_code: string;
  visit_type: ApiVisitType;
  date: string;
  start_time: string;
  duration_min: number;
  place_of_service: string;
  address: string | null;
  payer: ApiPayer;
}

export interface ApiBookingCheckRequest extends ApiBookingSlot {
  exclude: string | null;
}

export interface ApiConflict {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  who: string[];
  patient_mrn: string;
  provider_name: string;
  service: string;
}

export interface ApiUnitsSummary {
  unit_type: string;
  visit: number;
  week_start: string;
  week_allowed: number | null;
  week_used: number;
  makeup: number | null;
  makeup_until: string | null;
  remaining: number | null;
  total_allowed: number | null;
  total_used: number;
}

export interface ApiHoursBlock {
  title: string;
  start_time: string | null;
  end_time: string | null;
}

export interface ApiSlotAvailability {
  windows: { start_time: string; end_time: string }[];
  blocks: ApiHoursBlock[];
  within_hours: boolean | null;
  blocked_by: ApiHoursBlock[];
}

export interface ApiBookingCheckResult {
  conflicts: ApiConflict[];
  authorization: ApiAuthorizationRef | null;
  units: ApiUnitsSummary | null;
  availability: ApiSlotAvailability;
  evv_required: boolean;
  address: { id: string; line: string } | null;
}

export interface ApiRepeat {
  interval: number;
  unit: 'day' | 'week';
  weekdays: number[];
  ends: 'never' | 'on' | 'after';
  until?: string | null;
  count?: number | null;
}

export interface ApiConflictOverride {
  override_conflicts: boolean;
  conflict_reason: string;
}

export interface ApiAppointmentCreate extends ApiBookingSlot, ApiConflictOverride {
  notes: string;
  repeat: ApiRepeat | null;
}

export type ApiAppointmentUpdate = Partial<Omit<ApiBookingSlot, 'patient'>> &
  Partial<ApiConflictOverride> & { version: number; notes?: string };

export interface ApiAppointmentReschedule extends ApiConflictOverride {
  version: number;
  date: string;
  start_time: string;
  duration_min: number;
  note: string;
}
