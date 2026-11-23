export type ApiRequestStatusFilter = 'pending' | 'accepted' | 'declined' | 'all';

export type ApiDeclineReason =
  'too_far' | 'no_availability' | 'caseload_full' | 'wrong_specialty' | 'other';

export interface ApiPatientRequest {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  patient_status: string;
  services_requested: string[];
  service: string;
  service_label: string;
  town: string | null;
  status: string;
  status_label: string;
  decline_reason: string;
  decline_reason_label: string;
  decline_note: string;
  sent_at: string;
  sent_by_name: string;
  answered_at: string | null;
}

export interface ApiRequestCounts {
  pending: number;
  accepted: number;
  declined: number;
  withdrawn: number;
}

export interface ApiDeclineBody {
  reason: ApiDeclineReason;
  note: string;
}
