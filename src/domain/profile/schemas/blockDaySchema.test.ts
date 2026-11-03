import { blockDaySchema, type BlockDayFormValues } from '@/domain/profile/schemas/blockDaySchema';

const day = (date: number, hours = 0) => new Date(2026, 8, date, hours);

const values = (overrides: Partial<BlockDayFormValues> = {}): BlockDayFormValues => ({
  title: 'Vacation',
  startDate: day(10),
  endDate: day(12),
  specificHours: false,
  startTime: day(10, 9),
  endTime: day(10, 17),
  notifyOffice: true,
  ...overrides,
});

const errorPaths = (input: BlockDayFormValues) => {
  const result = blockDaySchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
};

describe('blockDaySchema', () => {
  it('accepts a valid block', () => {
    expect(errorPaths(values())).toEqual([]);
  });

  it('needs a title', () => {
    expect(errorPaths(values({ title: '   ' }))).toEqual(['title']);
  });

  it('allows a single-day block but not an end date before the start', () => {
    expect(errorPaths(values({ endDate: day(10) }))).toEqual([]);
    expect(errorPaths(values({ endDate: day(9) }))).toEqual(['endDate']);
  });

  it('checks times only when specific hours are on', () => {
    const backwards = { startTime: day(10, 17), endTime: day(10, 9) };
    expect(errorPaths(values(backwards))).toEqual([]);
    expect(errorPaths(values({ ...backwards, specificHours: true }))).toEqual(['endTime']);
  });
});
