import { buildOccurrences, type RepeatRule } from '@/domain/schedule/recurrence';
import { formatNumericDate } from '@/utils/dateFormat';

const start = new Date(2026, 8, 3);
const rule = (overrides: Partial<RepeatRule>): RepeatRule => ({
  every: 1,
  unit: 'week',
  weekdays: [4],
  ends: 'on',
  endsOn: new Date(2027, 7, 31),
  endsAfter: 13,
  ...overrides,
});
const span = (dates: Date[]) => [
  dates.length,
  formatNumericDate(dates[0]),
  formatNumericDate(dates[dates.length - 1]),
];

describe('buildOccurrences', () => {
  it('repeats weekly until the end date', () => {
    expect(span(buildOccurrences(start, rule({})))).toEqual([52, '09/03/2026', '08/26/2027']);
  });

  it('repeats daily until the end date, inclusive', () => {
    expect(span(buildOccurrences(start, rule({ unit: 'day' })))).toEqual([
      363,
      '09/03/2026',
      '08/31/2027',
    ]);
  });

  it('stops after a number of appointments', () => {
    const dates = buildOccurrences(start, rule({ ends: 'after', weekdays: [2, 4] }));
    expect(span(dates)).toEqual([13, '09/03/2026', '10/15/2026']);
  });

  it('skips weeks and never starts before the first day', () => {
    const dates = buildOccurrences(start, rule({ every: 2, weekdays: [1, 4], ends: 'after' }));
    expect(dates.slice(0, 3).map(formatNumericDate)).toEqual([
      '09/03/2026',
      '09/14/2026',
      '09/17/2026',
    ]);
  });

  it('caps an open-ended rule at a year', () => {
    expect(buildOccurrences(start, rule({ ends: 'never', unit: 'day' }))).toHaveLength(365);
  });
});
