export type PatientRequestStatus = 'waiting' | 'accepted' | 'declined';

export interface PatientRequest {
  id: string;
  status: PatientRequestStatus | 'withdrawn';
  statusLabel: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  disciplines: string[];
  city: string;
  offer: string;
  sentBy: string;
  sentAt: string;
  answeredAt?: string;
  declineReason?: string;
}

export interface RequestList {
  ids: string[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export interface RequestsState {
  byId: Record<string, PatientRequest>;
  lists: Record<PatientRequestStatus, RequestList>;
  counts: Record<PatientRequestStatus | 'withdrawn', number>;
}
