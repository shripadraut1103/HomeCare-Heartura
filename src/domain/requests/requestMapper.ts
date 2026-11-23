import type {
  ApiPatientRequest,
  ApiRequestStatusFilter,
} from '@/domain/requests/interfaces/RequestApi';
import type {
  PatientRequest,
  PatientRequestStatus,
} from '@/domain/requests/interfaces/RequestInterfaces';

const STATUSES: Record<string, PatientRequest['status']> = {
  pending: 'waiting',
  accepted: 'accepted',
  declined: 'declined',
  withdrawn: 'withdrawn',
};

export const API_FILTER: Record<PatientRequestStatus, ApiRequestStatusFilter> = {
  waiting: 'pending',
  accepted: 'accepted',
  declined: 'declined',
};

const DISCIPLINE_CODES: Record<string, string> = { speech: 'ST' };

export function toPatientRequest(api: ApiPatientRequest): PatientRequest {
  const reason = [api.decline_reason_label, api.decline_note].filter(Boolean).join(' · ');
  return {
    id: api.id,
    status: STATUSES[api.status] ?? 'waiting',
    statusLabel: api.status_label,
    patientId: api.patient_id,
    patientName: api.patient_name,
    patientMrn: api.patient_mrn,
    disciplines: api.services_requested.map(
      (service) => DISCIPLINE_CODES[service] ?? service.toUpperCase()
    ),
    city: api.town ?? '',
    offer: api.service_label || api.service.toUpperCase(),
    sentBy: api.sent_by_name,
    sentAt: api.sent_at,
    answeredAt: api.answered_at ?? undefined,
    declineReason: reason || undefined,
  };
}
