import { WEEKDAYS } from '@/domain/profile/availability';
import {
  availabilitySchema,
  type AvailabilityFormValues,
} from '@/domain/profile/schemas/availabilitySchema';
import { parseTimeOfDay } from '@/utils/dateFormat';

const slot = (start: string, end: string) => ({
  start: parseTimeOfDay(start),
  end: parseTimeOfDay(end),
});

const values = (
  monday: ReturnType<typeof slot>[],
  overrides: Partial<AvailabilityFormValues> = {}
): AvailabilityFormValues => ({
  startDate: new Date(2026, 8, 1),
  endDate: null,
  days: WEEKDAYS.map(({ id }) => ({
    weekday: id,
    enabled: id === 'mon',
    slots: id === 'mon' ? monday : [],
  })),
  ...overrides,
});

const errorPaths = (input: AvailabilityFormValues) => {
  const result = availabilitySchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('availabilitySchema', () => {
  it('accepts back-to-back slots', () => {
    expect(errorPaths(values([slot('08:00', '12:00'), slot('12:00', '17:00')]))).toEqual([]);
  });

  it('flags a slot that ends before it starts', () => {
    expect(errorPaths(values([slot('17:00', '09:00')]))).toEqual(['days.0.slots.0.end']);
  });

  it('flags the later of two overlapping slots', () => {
    expect(errorPaths(values([slot('13:00', '17:00'), slot('08:00', '14:00')]))).toEqual([
      'days.0.slots.0.start',
    ]);
  });

  it('ignores slots on a day that is turned off', () => {
    const input = values([slot('17:00', '09:00')]);
    input.days[0].enabled = false;
    expect(errorPaths(input)).toEqual([]);
  });

  it('allows no end date but not one before the start', () => {
    const monday = [slot('08:00', '17:00')];
    expect(errorPaths(values(monday, { endDate: new Date(2026, 7, 31) }))).toEqual(['endDate']);
    expect(errorPaths(values(monday, { endDate: new Date(2026, 8, 1) }))).toEqual([]);
  });
});
