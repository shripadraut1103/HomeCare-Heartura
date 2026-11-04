import { addDays, startOfDay, startOfWeek } from '@/domain/schedule/calendar';

export type RepeatUnit = 'day' | 'week';
export type RepeatEnd = 'never' | 'on' | 'after';

export type RepeatRule = {
  every: number;
  unit: RepeatUnit;
  weekdays: readonly number[];
  ends: RepeatEnd;
  endsOn: Date;
  endsAfter: number;
};

export const NEVER_HORIZON_DAYS = 365;
export const MAX_OCCURRENCES = 500;

export function buildOccurrences(start: Date, rule: RepeatRule): Date[] {
  const first = startOfDay(start);
  const last =
    rule.ends === 'on' ? startOfDay(rule.endsOn) : addDays(first, NEVER_HORIZON_DAYS - 1);
  const limit = rule.ends === 'after' ? Math.min(rule.endsAfter, MAX_OCCURRENCES) : MAX_OCCURRENCES;
  const every = Math.max(1, rule.every);
  const dates: Date[] = [];

  const push = (date: Date) => {
    if (date < first || dates.length >= limit) return;
    if (rule.ends !== 'after' && date > last) return;
    dates.push(date);
  };

  if (rule.unit === 'day') {
    for (let date = first; dates.length < limit; date = addDays(date, every)) {
      if (rule.ends !== 'after' && date > last) break;
      push(date);
    }
    return dates;
  }

  const weekdays = [...new Set(rule.weekdays.length ? rule.weekdays : [first.getDay()])].sort(
    (a, b) => a - b
  );
  for (let week = startOfWeek(first); dates.length < limit; week = addDays(week, 7 * every)) {
    if (rule.ends !== 'after' && week > last) break;
    weekdays.forEach((weekday) => push(addDays(week, weekday)));
  }
  return dates;
}
