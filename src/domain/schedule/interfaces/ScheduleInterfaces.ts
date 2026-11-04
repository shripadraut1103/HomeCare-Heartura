import type { VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';

export interface ScheduleFilter {
  patientId: string | null;
  statuses: VisitStatus[];
}

export const EMPTY_SCHEDULE_FILTER: ScheduleFilter = { patientId: null, statuses: [] };
