/**
 * Shapes of `/api/scheduling/appointments/` responses, copied from the OpenAPI schema
 * (`GET /api/schema/`). Regenerate rather than edit by hand when the backend changes.
 */

export interface ApiPatientSummary {
  id: string;
  name: string;
  mrn: string;
  dob: string | null;
  sex: string;
  phone: string;
  address: string;
  place_of_service: string;
  services: string[];
  status: string;
  residence: { name: string; agency: string; town: string } | null;
}

export interface ApiProviderSummary {
  id: string;
  name: string;
  discipline: string;
  discipline_label: string;
  role: string;
  supervisor: string;
}

export interface ApiAuthorizationRef {
  id: string;
  pa_number: string;
  start_date: string;
  end_date: string | null;
  total_units: number | null;
  units_per_week: number | null;
  unit_type: string;
}

export interface ApiAppointment {
  id: string;
  patient: ApiPatientSummary;
  provider: ApiProviderSummary;
  service_code: string;
  service_label: string;
  visit_type: string;
  visit_type_label: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  units: number;
  place_of_service: string;
  place_label: string;
  address: { id: string; line: string } | null;
  evv_required: boolean;
  payer: string;
  payer_label: string;
  status: string;
  status_label: string;
  status_note: string;
  notes: string;
  series: { id: string; summary: string } | null;
  authorization: ApiAuthorizationRef | null;
  rescheduled_from: string | null;
  rescheduled_to: string | null;
  conflict_overridden: boolean;
  conflict_reason: string;
  created_by_name: string;
  version: number;
  created_at: string;
  updated_at: string;
}
