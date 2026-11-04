import type { ScheduleFilter } from '@/domain/schedule/interfaces/ScheduleInterfaces';
import type { Visit, VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';
import { isVisitHappening } from '@/domain/visits/visitStatus';
import { toIsoDate } from '@/utils/dateFormat';

export const isFilterActive = (filter: ScheduleFilter) =>
  filter.patientId !== null || filter.statuses.length > 0;

export const applyScheduleFilter = (visits: readonly Visit[], filter: ScheduleFilter) =>
  visits.filter(
    (visit) =>
      (filter.patientId === null || visit.patientId === filter.patientId) &&
      (filter.statuses.length === 0 || filter.statuses.includes(visit.status))
  );

export const markedDays = (visits: readonly Visit[]): ReadonlySet<string> =>
  new Set(visits.map((visit) => toIsoDate(new Date(visit.startsAt))));

export const MAX_DAY_MARKS = 3;

export function dayStatuses(visits: readonly Visit[]): ReadonlyMap<string, VisitStatus[]> {
  const byDay = new Map<string, VisitStatus[]>();
  [...visits]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .forEach((visit) => {
      const key = toIsoDate(new Date(visit.startsAt));
      const statuses = byDay.get(key) ?? [];
      if (statuses.length < MAX_DAY_MARKS) statuses.push(visit.status);
      byDay.set(key, statuses);
    });
  return byDay;
}

export function summarizeDay(visits: readonly Visit[]) {
  const happening = visits.filter((visit) => isVisitHappening(visit.status));
  return {
    count: happening.length,
    minutes: happening.reduce((total, visit) => total + visit.durationMinutes, 0),
    completed: visits.filter((visit) => visit.status === 'completed').length,
  };
}
