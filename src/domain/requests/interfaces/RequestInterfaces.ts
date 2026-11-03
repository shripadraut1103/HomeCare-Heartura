export type PatientRequestStatus = 'waiting' | 'accepted' | 'declined';

export interface PatientRequest {
  id: string;
  status: PatientRequestStatus;
  patientName: string;
  age: number;
  /** Every discipline on the case, e.g. `['OT', 'PT']`. */
  disciplines: string[];
  city: string;
  /** The part of the case offered to this provider. */
  offer: { discipline: string; visitsPerWeek: number; durationMinutes: number };
  address: string;
  distanceMiles: number;
  authorization: string;
  coordinator: { name: string; organization: string };
  assignedBy: { name: string; role: string; /** ISO date-time. */ at: string };
  note?: string;
  declineReason?: string;
}

export interface RequestsState {
  requests: PatientRequest[];
}
