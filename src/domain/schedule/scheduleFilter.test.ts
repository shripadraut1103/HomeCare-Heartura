import {
  applyScheduleFilter,
  dayStatuses,
  isFilterActive,
  summarizeDay,
} from '@/domain/schedule/scheduleFilter';
import { EMPTY_SCHEDULE_FILTER } from '@/domain/schedule/interfaces/ScheduleInterfaces';
import type { Visit, VisitStatus } from '@/domain/visits/interfaces/VisitInterfaces';

const visit = (
  id: string,
  patientId: string,
  status: VisitStatus,
  durationMinutes: number,
  startsAt = new Date(2026, 8, 3, 9).toISOString()
) => ({ id, patientId, status, durationMinutes, startsAt }) as Visit;

const day = [
  visit('a', 'p1', 'inProgress', 45),
  visit('b', 'p2', 'completed', 120),
  visit('c', 'p1', 'cancelled', 45),
  visit('d', 'p3', 'noShow', 60),
];

describe('schedule filter', () => {
  it('counts only visits that happen, and their minutes', () => {
    expect(summarizeDay(day)).toEqual({ count: 2, minutes: 165, completed: 1 });
  });

  it('matches patient and any of the chosen statuses', () => {
    const ids = (statuses: VisitStatus[], patientId: string | null = null) =>
      applyScheduleFilter(day, { patientId, statuses }).map((item) => item.id);

    expect(ids([])).toEqual(['a', 'b', 'c', 'd']);
    expect(ids(['cancelled', 'noShow'])).toEqual(['c', 'd']);
    expect(ids([], 'p1')).toEqual(['a', 'c']);
    expect(ids(['cancelled'], 'p1')).toEqual(['c']);
  });

  it('knows when a filter is on', () => {
    expect(isFilterActive(EMPTY_SCHEDULE_FILTER)).toBe(false);
    expect(isFilterActive({ patientId: null, statuses: ['completed'] })).toBe(true);
  });

  it('marks each day with up to three statuses in time order', () => {
    const at = (day: number, hour: number) => new Date(2026, 8, day, hour).toISOString();
    const marks = dayStatuses([
      visit('a', 'p1', 'cancelled', 45, at(3, 14)),
      visit('b', 'p1', 'completed', 45, at(3, 9)),
      visit('c', 'p2', 'scheduled', 45, at(3, 16)),
      visit('d', 'p3', 'noShow', 45, at(3, 17)),
      visit('e', 'p3', 'scheduled', 45, at(4, 9)),
    ]);

    expect(marks.get('2026-09-03')).toEqual(['completed', 'cancelled', 'scheduled']);
    expect(marks.get('2026-09-04')).toEqual(['scheduled']);
    expect(marks.has('2026-09-05')).toBe(false);
  });
});
