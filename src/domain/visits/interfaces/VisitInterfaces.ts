export type VisitStatus =
  'scheduled' | 'inProgress' | 'completed' | 'cancelled' | 'noShow' | 'rescheduled';

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  patientTag: string;
  startsAt: string;
  durationMinutes: number;
  status: VisitStatus;
  visitType: string;
  discipline: string;
  summary: string;
  providerName: string;
  location: string;
  address: string;
  travel?: { miles: number; driveMinutes: number };
  phone: string;
  guardian?: string;
  payer: string;
  units: {
    summary: string;
    detail?: string;
  };
  notes?: string;
  documents?: string;
  outcome?: string;
}
