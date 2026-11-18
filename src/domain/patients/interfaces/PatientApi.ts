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
  county: string;
  providers: { id: string; name: string; discipline: string }[];
  version: number;
  created_at: string;
  updated_at: string;
}
